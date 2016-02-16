const args = require('yargs').argv;

const geth = require('./lib/geth');
const logger = require('./lib/logger');

const execFifty = function(owner) {
  const fifty = require('./game/fifty');

  if (!args['contract-fifty']) {
    logger.error('Lottery', 'exec', '--contract-fifty <addr>');
    return;
  }

  switch (args.exec) {
    case 'balance':
      logger.log('Lottery', 'balance', lottery.getBalance());
      break;
    default:
      logger.error('Fifty', 'exec', '--exec <balance|fees|withdraw>');
      break;
  }
};

const execLottery = function(owner) {
  const lottery = require('./game/lottery');

  if (!args['contract-lottery']) {
    logger.error('Lottery', 'exec', '--contract-lottery <addr>');
    return;
  }

  switch (args.exec) {
    case 'balance':
      logger.log('Lottery', 'balance', lottery.getBalance());
      break;
    default:
      logger.error('Lottery', 'exec', '--exec <balance|withdraw>');
      break;
  }
};

const run = function() {
  if (!args.owner) {
    logger.error('Owner', 'run', '--owner <owner>');
  } else {
    switch (args.game) {
      case 'fifty': execFifty(args.owner); break;
      case 'lottery': execLottery(args.owner); break;
      default: logger.error('Owner', 'run', '--game <fifty|lottery>');
    }
  }

  process.exit(0);
};

(function() {
  geth.init().then(run);
})();
