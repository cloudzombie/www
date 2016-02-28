const _ = require('lodash');
const glob = require('glob').sync;
const router = require('express').Router(); // eslint-disable-line new-cap

const logger = require('../../../lib/logger');

_.each(_.reject(glob('*.js', { cwd: __dirname }), _.matches('index.js')), (file) => {
  logger.log('Api', 'init', `loading router for ${file}`);

  router.use(`/${file.replace('.js', '')}`, require(`./${file}`));
});

module.exports = router;
