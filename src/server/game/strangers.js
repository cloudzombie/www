const _ = require('lodash');

const channels = require('../config/channels').strangers;
const contract = require('../config/contracts').strangers;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const strangers = contract.addr ? geth.getContract(contract) : null;

if (!strangers) {
  logger.error('strangers', 'init', 'invalid contract value, address not set');
  module.exports = {
    init: function() { return {}; },
    get: function() { return {}; }
  };
} else {
  const CONFIG_NUM_PARTICIPANTS = strangers.CONFIG_NUM_PARTICIPANTS(); // eslint-disable-line new-cap
  const CONFIG_MIN_VALUE = strangers.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
  const CONFIG_MAX_VALUE = strangers.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
  const CONFIG_FEES_DIV = strangers.CONFIG_FEES_DIV().toNumber(); // eslint-disable-line new-cap
  const CONFIG_FEES_EDGE = 1.0 / CONFIG_FEES_DIV; // eslint-disable-line new-cap
  const CONFIG_ABI = JSON.stringify(contract.abi);
  const CONFIG = {
    addr: contract.addr,
    min: CONFIG_MIN_VALUE.toString(),
    max: CONFIG_MAX_VALUE.toString(),
    strangers: CONFIG_NUM_PARTICIPANTS.toNumber(),
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
    const txs = strangers.txs().toNumber();

    return {
      txs: txs,
      paid: Math.max(0, txs - CONFIG_NUM_PARTICIPANTS.toNumber()),
      turnover: strangers.turnover().toString(),
      pool: strangers.pool().toString()
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
      at: geth.toTime(data.args.at),
      sender: data.args.sender,
      input: data.args.input.toString(),
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
    geth.startEvents(contract, (error, data) => {
      if (error) {
        logger.error('Strangers', 'watch', error);
        return;
      }

      switch (data.event) {
        case 'Player': eventPlayer(data); break;
        default:
          logger.error('Strangers', 'watch', `Unknown event ${data.event}`);
      }
    });
  };

  module.exports = {
    init: init,
    get: get
  };
}
