const _ = require('lodash');
const Promise = require('bluebird');

const channels = require('../config/channels').shuffle;
const contract = require('../config/contracts').shuffle;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const CONFIG = {
  addr: contract.addr,
  abi: JSON.stringify(contract.abi),
  version: geth.getVersion()
};

const methods = geth.attachAbi(contract);

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
  return Promise
    .all([
      methods.txs(),
      methods.turnover(),
      methods.pool()
    ])
    .then((data) => {
      return {
        txs: data[0].toNumber(),
        paid: Math.max(0, data[0].minus(CONFIG.strangers).toNumber()),
        turnover: data[1].toString(),
        pool: data[2].toString()
      };
    });
};

const get = function() {
  return getGame().then((game) => {
    return {
      config: CONFIG,
      players: players,
      current: game
    };
  });
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
    paid: Math.max(0, txs - CONFIG.strangers),
    txhash: data.transactionHash
  };

  addPlayer(player);
};

const initConfig = function() {
  return Promise
    .all([
      methods.CONFIG_MIN_VALUE(), // eslint-disable-line new-cap
      methods.CONFIG_MAX_VALUE(), // eslint-disable-line new-cap
      methods.CONFIG_NUM_PARTICIPANTS(), // eslint-disable-line new-cap
      methods.CONFIG_FEES_DIV() // eslint-disable-line new-cap
    ])
    .then((data) => {
      CONFIG.min = data[0].toString();
      CONFIG.max = data[1].toString();
      CONFIG.strangers = data[3].toNumber();
      CONFIG.edge = 1.0 / data[4].toNumber();

      return CONFIG;
    });
};

const init = function() {
  return initConfig().then(() => {
    geth.startEvents(contract, (data) => {
      switch (data.event) {
        case 'Player': eventPlayer(data); break;
        default:
          logger.error('Shuffle', 'watch', `Unknown event ${data.event}`);
      }
    });
  });
};

module.exports = {
  init: init,
  get: get
};
