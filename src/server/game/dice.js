const _ = require('lodash');
const Promise = require('bluebird');
const BigNumber = require('bignumber.js');

const channels = require('../config/channels').dice;
const contract = require('../config/contracts').dice;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const CONFIG = {
  addr: contract.addr,
  abi: JSON.stringify(contract.abi)
};

const methods = geth.attachAbi(contract);

if (!methods) {
  logger.error('Dice', 'init', 'invalid contract value, address not set');
  module.exports = {
    init: function() { return {}; },
    get: function() { return {}; }
  };
} else {
  let winner;
  let players = [];

  const addPlayer = function(player) {
    if (_.find(players, { txs: player.txs })) {
      return;
    }

    if (player.winner && (!winner || player.txs > winner.txs)) {
      winner = player;
    }

    pubsub.publish(channels.player, player);

    players.unshift(player);
    players = players.slice(0, 15);
  };

  const getGame = function() {
    return Promise
      .all([
        methods.txs(),
        methods.wins(),
        methods.losses(),
        methods.turnover(),
        methods.funds()
      ])
      .then((data) => {
        return {
          txs: data[0].toNumber(),
          wins: data[1].toNumber(),
          losses: data[2].toNumber(),
          turnover: data[3].toString(),
          funds: data[4].toString()
        };
      });
  };

  const get = function() {
    return getGame().then((game) => {
      return {
        config: CONFIG,
        winner: winner,
        players: players,
        current: game
      };
    });
  };

  const eventPlayer = function(data) {
    const total = data.args.txs.toNumber();
    const wins = data.args.wins.toNumber();
    const losses = total - wins;

    if (!_.isNumber(total) || !total) {
      return;
    }

    const sum = data.args.play.toNumber();
    const rangeh = Math.floor(sum / 10);
    const rangel = sum % 10;

    let play;

    if (sum <= 1) {
      play = sum ? 'Odd' : 'Even';
    } else if (sum <= 12) {
      play = `${sum}`;
    } else if (rangeh === rangel) {
      play = `${rangel}`;
    } else {
      play = `${rangeh} to ${rangel}`;
    }

    const dicea = data.args.dicea.toNumber();
    const diceb = data.args.diceb.toNumber();

    const player = {
      addr: data.args.addr,
      at: geth.toTime(data.args.at),
      play: play,
      chance: data.args.chance.toNumber() / 36.0,
      dicea: dicea,
      diceb: diceb,
      sum: dicea + diceb,
      input: data.args.input.toString(),
      output: data.args.output.toString(),
      winner: data.args.output.gt(data.args.input),
      turnover: data.args.turnover.toString(),
      txs: total,
      wins: wins,
      losses: losses,
      txhash: data.transactionHash
    };

    addPlayer(player);
  };

  const initConfig = function() {
    return Promise
      .all([
        methods.CONFIG_MIN_VALUE(), // eslint-disable-line
        methods.CONFIG_MAX_VALUE(), // eslint-disable-line
        methods.CONFIG_FEES_MUL(), // eslint-disable-line
        methods.CONFIG_FEES_DIV() // eslint-disable-line
      ])
      .then((data) => {
        CONFIG.min = data[0].toString();
        CONFIG.max = data[1].toString();
        CONFIG.edge = data[2].toNumber() / data[3].toNumber();
      });
  };

  const init = function() {
    initConfig();

    geth.startEvents(contract, (data) => {
      switch (data.event) {
        case 'Player': eventPlayer(data); break;
        default:
          logger.error('Dice', 'watch', `Unknown event ${data.event}`);
      }
    });
  };

  module.exports = {
    init: init,
    get: get
  };
}
