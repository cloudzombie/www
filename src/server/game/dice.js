const _ = require('lodash');

const channels = require('../config/channels').dice;
const contract = require('../config/contracts').dice;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const dice = contract ? geth.getContract(contract) : null;

const NUMBERS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

const CONFIG_MIN_VALUE = dice.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
const CONFIG_MAX_VALUE = dice.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
const CONFIG_FEES_MUL = dice.CONFIG_FEES_MUL().toNumber(); // eslint-disable-line new-cap
const CONFIG_FEES_DIV = dice.CONFIG_FEES_DIV().toNumber(); // eslint-disable-line new-cap
const CONFIG_FEES_EDGE = CONFIG_FEES_MUL / CONFIG_FEES_DIV; // eslint-disable-line new-cap
const CONFIG = {
  addr: contract.addr,
  min: CONFIG_MIN_VALUE.toString(),
  max: CONFIG_MAX_VALUE.toString(),
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

const getGame = function() {
  return {
    wins: dice.wins().toNumber(),
    losses: dice.wins().toNumber(),
    txs: dice.txs().toNumber(),
    turnover: dice.turnover().toString(),
    funds: dice.funds().toString()
  };
};

const get = function() {
  return {
    config: CONFIG,
    winner: winner,
    players: players,
    current: getGame()
  };
};

const eventPlayer = function(data) {
  const total = data.args.txs.toNumber();
  const wins = data.args.wins.toNumber();
  const losses = total - wins;

  if (!_.isNumber(total) || !total) {
    return;
  }

  const pdata = data.args.play.toNumber();
  let play;

  if (pdata <= 1) {
    play = pdata ? 'Odd' : 'Even';
  } else if (pdata <= 12) {
    play = `${NUMBERS[pdata]}`;
  } else {
    play = `${NUMBERS[Math.floor(pdata / 10)]} to ${NUMBERS[pdata % 10]}`;
  }

  const player = {
    addr: data.args.addr,
    at: geth.toTime(data.args.at),
    play: play,
    chance: data.args.chance.toNumber() / 36.0,
    dicea: data.args.dicea.toNumber(),
    diceb: data.args.diceb.toNumber(),
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

  pubsub.publish(channels.player, player);
};

const init = function() {
  if (!dice) {
    logger.error('Dice', 'init', 'invalid contract value, address not set');
    return;
  }

  dice.allEvents({ fromBlock: geth.getEventBlock() }, (error, data) => {
    logger.log('Dice', 'watch', data);

    if (error) {
      logger.log('Dice', 'watch', error);
      return;
    }

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
