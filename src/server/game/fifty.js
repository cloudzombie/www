const channels = require('../config/channels').fifty;
const contract = require('../config/contracts').fifty;
const geth = require('../lib/geth');
const pubsub = require('../route/pubsub');

const fifty = geth.getContract(contract);

const CONFIG_PRICE = fifty.CONFIG_PRICE(); // eslint-disable-line new-cap
const CONFIG_MIN_VALUE = fifty.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
const CONFIG_MAX_VALUE = fifty.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
const CONFIG_MAX_PLAYS = fifty.CONFIG_MAX_PLAYS(); // eslint-disable-line new-cap
const CONFIG_FEES_MUL = fifty.CONFIG_FEES_MUL(); // eslint-disable-line new-cap
const CONFIG_FEES_DIV = fifty.CONFIG_FEES_DIV(); // eslint-disable-line new-cap
const CONFIG_FEES_EDGE = CONFIG_FEES_MUL.toNumber() / CONFIG_FEES_DIV.toNumber();
const CONFIG = {
  addr: contract.addr,
  price: CONFIG_PRICE.toString(),
  min: CONFIG_MIN_VALUE.toString(),
  max: CONFIG_MAX_VALUE.toString(),
  tickets: CONFIG_MAX_PLAYS.toNumber(),
  edge: CONFIG_FEES_EDGE
};

let winner;
let players = [];

const addPlayer = function(player) {
  if (player.winner && (!winner || player.txs > winner.txs)) {
    winner = player;
  }

  players.unshift(player);
  players = players.slice(0, 10);
};

const get = function() {
  return {
    config: CONFIG,
    winner: winner,
    players: players
  };
};

const init = function() {
  geth.watch('Fifty', fifty.NextPlayer, (data) => {
    const txs = data.args.txs && data.args.txs.toNumber();

    if (!txs) {
      return;
    }

    const pwins = data.args.pwins.toNumber();
    const plosses = data.args.plosses.toNumber();
    const ptxs = pwins + plosses;
    const wins = data.args.wins.toNumber();
    const _winner = data.args.output.gt(data.args.input);

    const player = {
      addr: data.args.addr,
      at: geth.toTime(data.args.at),
      input: data.args.input.toString(),
      output: data.args.output.toString(),
      winner: _winner,
      pwins: pwins,
      ptxs: ptxs,
      pratio: `${((pwins * 100) / ptxs).toFixed(2)}%`,
      wins: wins,
      txs: txs,
      played: data.args.played.toString(),
      ratio: `${((wins * 100) / txs).toFixed(2)}%`,
      txhash: data.transactionHash
    };

    addPlayer(player);

    pubsub.publish(channels.player, player);
  });
};

const getBalance = function() {
  const balance = geth.getBalance(contract.addr).toString();

  return {
    balance: balance
  };
};

module.exports = {
  init: init,
  get: get,
  getBalance: getBalance
};
