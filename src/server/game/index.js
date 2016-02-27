const _ = require('lodash');
const glob = require('glob');

const logger = require('../lib/logger');

const init = function() {
  logger.log('Game', 'init', 'initializing games');

  glob('*.js', { cwd: __dirname }, (error, files) => {
    if (error) {
      logger.error('Game', 'init', error);
      return;
    }

    _.each(files, (file) => {
      if (file.indexOf('index.js') === -1) {
        require(`./${file}`).init();
      }
    });
  });

  logger.log('Game', 'init', 'initialized all games');
};

module.exports = {
  init: init
};
