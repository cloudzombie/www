const args = require('yargs').argv;

const geth = require('./lib/geth');
const logger = require('./lib/logger');

const UNITS = ['wei', 'ada', 'babbage', 'shannon', 'szabo', 'finney', 'ether', 'kether', 'mether', 'gether', 'tether'];

const toWei = function(number) {
  let unitidx = 0;
  let value = number;
  let decimal = '0';

  while (value.length > 3 && unitidx < UNITS.length - 1) {
    decimal = value.substr(value.length - 3);
    value = value.substr(0, value.length - 3);
    unitidx++;
  }

  return { value: parseFloat(`${value}.${decimal}`).toFixed(2), unit: UNITS[unitidx] };
};

const execFifty = function(owner) {
  const game = require('./game/fifty');

  if (!args['contract-fifty']) {
    logger.error('Lottery', 'exec', '--contract-fifty <addr>');
    return;
  }

  switch (args.exec) {
    case 'balance':
      const balance = game.getBalance(owner);

      logger.log('Fifty', 'balance', {
        balance: {
          value: balance.balance,
          wei: toWei(balance.balance)
        }
      });
      break;

    default:
      logger.error('Fifty', 'exec', '--exec <balance|fees|withdraw>');
      break;
  }
};

const execLottery = function(owner) {
  const game = require('./game/lottery');

  if (!args['contract-lottery']) {
    logger.error('Lottery', 'exec', '--contract-lottery <addr>');
    return;
  }

  switch (args.exec) {
    case 'balance':
      const balance = game.getBalance(owner);

      logger.log('Lottery', 'balance', {
        balance: {
          value: balance.balance,
          wei: toWei(balance.balance)
        },
        fees: {
          value: balance.fees,
          wei: toWei(balance.fees)
        }
      });
      break;

    default:
      logger.error('Lottery', 'exec', '--exec <balance|withdraw>');
      break;
  }
};

const run = function() {
  try {
    if (!args.owner) {
      logger.error('Owner', 'run', '--owner <owner>');
    } else {
      switch (args.game) {
        case 'fifty': execFifty(args.owner); break;
        case 'lottery': execLottery(args.owner); break;
        default: logger.error('Owner', 'run', '--game <fifty|lottery>');
      }
    }
  } catch (e) {
    logger.error('Owner', 'run', e);
  }

  process.exit(0);
};

(function() {
  geth.init().then(run);
})();
