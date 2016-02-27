const logger = require('../lib/logger');

const dice = require('./dice');
const fifty = require('./fifty');
const lottery = require('./lottery');

const init = function() {
  logger.log('Game', 'init', 'initializing games');

  box.init();
  dice.init();
  fifty.init();
  lottery.init();

  logger.log('Game', 'init', 'initialized all games');
};

module.exports = {
  init: init
};
