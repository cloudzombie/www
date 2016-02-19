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

const CONFIG_MIN_VALUE = dice.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
const CONFIG_MAX_VALUE = dice.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
const CONFIG_MIN_FUNDS = dice.CONFIG_MIN_FUNDS(); // eslint-disable-line new-cap
const CONFIG_MAX_FUNDS = dice.CONFIG_MAX_FUNDS(); // eslint-disable-line new-cap
const CONFIG_RETURN_MUL = dice.CONFIG_RETURN_MUL().toNumber(); // eslint-disable-line new-cap
const CONFIG_RETURN_DIV = dice.CONFIG_RETURN_DIV().toNumber(); // eslint-disable-line new-cap
const CONFIG_HOUSE_EDGE = 100.0 - (CONFIG_RETURN_MUL / CONFIG_RETURN_DIV); // eslint-disable-line new-cap
const CONFIG_FEES_MUL = dice.CONFIG_FEES_MUL().toNumber(); // eslint-disable-line new-cap
const CONFIG_FEES_DIV = dice.CONFIG_FEES_DIV().toNumber(); // eslint-disable-line new-cap
const CONFIG_FEES_EDGE = CONFIG_FEES_MUL / CONFIG_FEES_DIV; // eslint-disable-line new-cap
const CONFIG = {
  addr: contract.addr,
  min: CONFIG_MIN_VALUE.toString(),
  max: CONFIG_MAX_VALUE.toString(),
  mmmin: CONFIG_MIN_FUNDS.toString(),
  mmmax: CONFIG_MAX_FUNDS.toString(),
  edge: CONFIG_FEES_EDGE,
  house: CONFIG_HOUSE_EDGE,
  bets: BETS
};

let winner;
let players = [];

const addPlayer = function(player) {
  if (player.winner && (!winner || player.tkplays > winner.tkplays)) {
    winner = player;
  }

  players.unshift(player);
  players = players.slice(0, 10);
};

const getFunds = function() {
  return dice.funds.toString();
};

const get = function() {
  return {
    config: CONFIG,
    winner: winner,
    players: players,
    funds: getFunds()
  };
};

const eventPlayer = function(data) {
  console.log(data);

  const player = {
    addr: data.args.addr,
    at: geth.toTime(data.args.at),
    turnover: data.args.turnover.toString(),
    txhash: data.transactionHash
  };

  addPlayer(player);

  pubsub.publish(channels.player, player);
};

const init = function() {
  dice.allEvents({ fromBlock: geth.getEventBlock() }, (error, data) => {
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
