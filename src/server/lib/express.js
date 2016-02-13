const compression = require('compression');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

const srvcfg = require('../config/server');
const logger = require('./logger');
const responder = require('./responder');

const create = function() {
  logger.log('Express', 'create', 'creating express app');

  const app = express();

  app.set('port', srvcfg.port);

  app.use(morgan('combined'));
  app.use(bodyParser.json());

  app.get('/pubsub/*', require('../route/pubsub'));

  app.use(compression());
  app.use(express.static(path.join(__dirname, '..', 'public'))); // , { maxAge: MAXAGE }));

  app.use('/', require('../route'));

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    responder.error(res, err);
  });

  return app;
};

module.exports = {
  create: create
};
