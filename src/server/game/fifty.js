const channels = require('../config/channels').fifty;
const contract = require('../config/contracts').lottery;
const geth = require('../lib/geth');
const pubsub = require('../route/pubsub');

const fifty = geth.getContract(contract);

const players = [];

const addPlayer = function(player) {
  players.push(player);
};

const init = function() {
  geth.watch('LooneyFifty', fifty.NewPlay, (data) => {
    if (!data.args.at) {
      return;
    }

    const player = {
      addr: data.args.addr,
      at: geth.toTime(data.args.at),
      input: data.args.input.toNumber(),
      output: data.args.output.toNumber(),
      pool: data.args.pool.toNumber(),
      txhash: data.transactionHash
    };

    addPlayer(player);

    pubsub.publish(channels.player, player);
  });
};

module.exports = {
  init: init
};
