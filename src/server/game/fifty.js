const channels = require('../config/channels').fifty;
const contract = require('../config/contracts').fifty;
const geth = require('../lib/geth');
const pubsub = require('../route/pubsub');

const fifty = geth.getContract(contract);

const CONFIG = {
  addr: contract.addr
};

let players = [];

const addPlayer = function(player) {
  players.unshift(player);
  players = players.slice(0, 10);
};

const get = function() {
  return {
    config: CONFIG,
    players: players
  };
};

const init = function() {
  geth.watch('Fifty', fifty.NextPlayer, (data) => {
    if (!data.args.at) {
      return;
    }

    const pwins = data.args.pwins.toNumber();
    const plosses = data.args.plosses.toNumber();
    const ptxs = pwins + plosses;
    const wins = data.args.wins.toNumber();
    const txs = data.args.txs.toNumber();

    const player = {
      addr: data.args.addr,
      at: geth.toTime(data.args.at),
      input: data.args.input.toString(),
      output: data.args.output.toString(),
      pwins: pwins,
      ptxs: ptxs,
      pratio: `${((pwins * 100) / ptxs).toFixed(2)}%`,
      wins: wins,
      txs: txs,
      ratio: `${((wins * 100) / txs).toFixed(2)}%`,
      txhash: data.transactionHash
    };

    addPlayer(player);

    pubsub.publish(channels.player, player);
  });
};

module.exports = {
  init: init,
  get: get
};
