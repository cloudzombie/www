const channels = require('../config/channels').fifty;
const contract = require('../config/contracts').fifty;
const geth = require('../lib/geth');
const pubsub = require('../route/pubsub');

const fifty = geth.getContract(contract);

const players = [];

const addPlayer = function(player) {
  players.push(player);
};

const init = function() {
  geth.watch('Fifty', fifty.NextPlayer, (data) => {
    if (!data.args.at) {
      return;
    }

    const player = {
      addr: data.args.addr,
      at: geth.toTime(data.args.at),
      input: data.args.input.toString(),
      output: data.args.output.toString(),
      pool: data.args.pool.toString(),
      txhash: data.transactionHash
    };

    addPlayer(player);

    pubsub.publish(channels.player, player);
  });
};

module.exports = {
  init: init
};
