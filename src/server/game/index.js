const _ = require('lodash');
const glob = require('glob').sync;

const logger = require('../lib/logger');

const init = function() {
  logger.log('Game', 'init', 'initializing games');

  _.each(_.reject(glob('*.js', { cwd: __dirname }), _.matches('index.js')), (file) => {
    logger.log('Game', 'init', `initializing ${file}`);

    require(`./${file}`).init();
  });

  logger.log('Game', 'init', 'initialized all games');
};

module.exports = {
  init: init
};
