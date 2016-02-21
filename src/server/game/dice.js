const _ = require('lodash');

const channels = require('../config/channels').dice;
const contract = require('../config/contracts').dice;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const dice = geth.getContract(contract);

const BETS = {
  'E': { short: 'Even', long: 'Even sum' },
  'O': { short: 'Odd', long: 'Odd sum' },
  '2': { short: 'Two', long: 'Exactly 2' },
  '3': { short: 'Three', long: 'Exactly 3' },
  '4': { short: 'Four', long: 'Exactly 4' },
  '5': { short: 'Five', long: 'Exactly 5' },
  '6': { short: 'Six', long: 'Exactly 6' },
  '7': { short: 'Seven', long: 'Exactly 7' },
  '8': { short: 'Eight', long: 'Exactly 8' },
  '9': { short: 'Nine', long: 'Exactly 9' },
  '0': { short: 'Ten', long: 'Exactly 10' },
  '1': { short: 'Eleven', long: 'Exactly 11' },
  'X': { short: 'Twelve', long: 'Exactly 12' },
  '>': { short: '> Seven', long: 'Larger than median' },
  '<': { short: '< Seven', long: 'Smaller than median' },
  '=': { short: 'A = B', long: 'Equal dice numbers' },
  '!': { short: 'A <> B', long: 'Unequal dice numbers' },
  'D': { short: '>= Ten', long: 'Double digit sum' },
  'S': { short: '< Ten', long: 'Single digit sum' }
};

const BETALIAS = {};

const CONFIG_MIN_VALUE = dice.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
const CONFIG_MAX_VALUE = dice.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
const CONFIG_FEES_MUL = dice.CONFIG_FEES_MUL().toNumber(); // eslint-disable-line new-cap
const CONFIG_FEES_DIV = dice.CONFIG_FEES_DIV().toNumber(); // eslint-disable-line new-cap
const CONFIG_FEES_EDGE = CONFIG_FEES_MUL / CONFIG_FEES_DIV; // eslint-disable-line new-cap
const CONFIG = {
  addr: contract.addr,
  min: CONFIG_MIN_VALUE.toString(),
  max: CONFIG_MAX_VALUE.toString(),
  edge: CONFIG_FEES_EDGE,
  bets: BETS,
  betalias: BETALIAS
};

let winner;
let players = [];

const addPlayer = function(player) {
  if (player.winner && (!winner || player.total > winner.total)) {
    winner = player;
  }

  players.unshift(player);
  players = players.slice(0, 10);
};

const getGame = function() {
  return {
    wins: dice.wins().toNumber(),
    losses: dice.wins().toNumber(),
    total: dice.txs().toNumber(),
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
  const dices = data.args.dice.toNumber();
  const total = data.args.txs.toNumber();
  const wins = data.args.wins.toNumber();
  const losses = total - wins;

  if (!_.isNumber(total) || !total) {
    return;
  }

  const player = {
    addr: data.args.addr,
    at: geth.toTime(data.args.at),
    bet: String.fromCharCode(data.args.bet.toNumber()),
    dicea: dices & 0x0f,
    diceb: dices & 0xf0,
    input: data.args.input.toString(),
    output: data.args.output.toString(),
    winner: data.args.output.gt(winner.args.input),
    turnover: data.args.turnover.toString(),
    total: total,
    wins: wins,
    losses: losses,
    txhash: data.transactionHash
  };

  addPlayer(player);

  pubsub.publish(channels.player, player);
};

const init = function() {
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
