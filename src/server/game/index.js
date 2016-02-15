const logger = require('../lib/logger');

const fifty = require('./fifty');
const lottery = require('./lottery');

const init = function() {
  logger.log('Game', 'init', 'initializing games');

  fifty.init();
  lottery.init();

  logger.log('Game', 'init', 'initialized all games');
};

module.exports = {
  init: init
};
