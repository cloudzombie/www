const _ = require('lodash');
const cluster = require('cluster');
const http = require('http');

const srvcfg = require('./config/server');
const logger = require('./lib/logger');

const initMaster = function() {
  const cpus = srvcfg.cluster ? require('os').cpus() : [1];

  logger.log('Server', 'initMaster', `master fork()-ing ${cpus.length} child processes`);
  _.forEach(cpus, () => {
    cluster.fork();
  });

  cluster.on('exit', () => {
    cluster.fork();
    logger.error('Server', 'initMaster', 'child process killed, fork()-ed a new one');
  });
};

const initChild = function() {
  const geth = require('./lib/geth');

  geth.init().then(() => {
    const games = require('./game');
    const express = require('./lib/express');

    const server = http.createServer(express.create());

    games.init();

    server.listen(srvcfg.port, () => {
      logger.log('Server', 'initChild', `started, listening on port ${srvcfg.port}`);
    });
  });
};

if (cluster.isMaster) {
  initMaster();
} else {
  initChild();
}
