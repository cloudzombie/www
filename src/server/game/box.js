const _ = require('lodash');

const channels = require('../config/channels').box;
const contract = require('../config/contracts').box;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const box = contract.addr ? geth.getContract(contract) : null;

if (!box) {
  logger.error('Box', 'init', 'invalid contract value, address not set');
  module.exports = {
    init: function() { return {}; },
    get: function() { return {}; }
  };
} else {
  const CONFIG_NUM_PARTICIPANTS = box.CONFIG_NUM_PARTICIPANTS(); // eslint-disable-line new-cap
  const CONFIG_MIN_VALUE = box.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
  const CONFIG_MAX_VALUE = box.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
  const CONFIG_FEES_DIV = box.CONFIG_FEES_DIV().toNumber(); // eslint-disable-line new-cap
  const CONFIG_FEES_EDGE = 1.0 / CONFIG_FEES_DIV; // eslint-disable-line new-cap
  const CONFIG_ABI = JSON.stringify(contract.spec.interface);
  const CONFIG = {
    addr: contract.addr,
    min: CONFIG_MIN_VALUE.toString(),
    max: CONFIG_MAX_VALUE.toString(),
    boxes: CONFIG_NUM_PARTICIPANTS.toNumber(),
    edge: CONFIG_FEES_EDGE,
    abi: CONFIG_ABI
  };

  let players = [];

  const addPlayer = function(player) {
    if (_.find(players, { txs: player.txs })) {
      return;
    }

    pubsub.publish(channels.player, player);

    players.unshift(player);
    players = players.slice(0, 15);
  };

  const getGame = function() {
    const txs = box.txs().toNumber();

    return {
      txs: txs,
      paid: Math.max(0, txs - CONFIG_NUM_PARTICIPANTS.toNumber()),
      turnover: box.turnover().toString(),
      pool: box.pool().toString()
    };
  };

  const get = function() {
    return {
      config: CONFIG,
      players: players,
      current: getGame()
    };
  };

  const eventPlayer = function(data) {
    const txs = data.args.txs.toNumber();

    if (!_.isNumber(txs) || !txs) {
      return;
    }

    const player = {
      addr: data.args.addr,
      at: geth.toTime(data.args.at),
      receiver: data.args.receiver,
      output: data.args.output.toString(),
      turnover: data.args.turnover.toString(),
      pool: data.args.pool.toString(),
      txs: txs,
      paid: Math.max(0, txs - CONFIG_NUM_PARTICIPANTS.toNumber()),
      txhash: data.transactionHash
    };

    addPlayer(player);
  };

  const init = function() {
    geth.startEvents(contract.addr, contract.spec.interface, (error, data) => {
      if (error) {
        logger.error('Box', 'watch', error);
        return;
      }

      switch (data.event) {
        case 'Player': eventPlayer(data); break;
        default:
          logger.error('Box', 'watch', `Unknown event ${data.event}`);
      }
    });
  };

  module.exports = {
    init: init,
    get: get
  };
}
