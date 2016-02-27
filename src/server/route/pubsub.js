const _ = require('lodash');

const logger = require('../lib/logger');

const connections = {};
let id = 0;

const addConnection = function(res, channel) {
  const resid = `id_${++id}`;

  connections[channel] = connections[channel] || {};
  connections[channel][resid] = function(json) {
    res.write(`id: ${resid}_${Date.now()}\ndata: ${json}\n\n`);
  };

  return resid;
};

const delConnection = function(resid, channel) {
  delete connections[channel][resid];
};

const route = function(req, res) {
  logger.log('PubSub', 'route', `adding connection on ${req.path}`);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const resid = addConnection(res, req.path);

  res.on('close', () => {
    logger.log('PubSub', 'route', `deleting connection on ${req.path}`);
    delConnection(resid, req.path);
  });
};

route.publish = function(channel, data) {
  logger.log('PubSub', 'publish', `sending on ${channel}`);

  const json = JSON.stringify({ data: data });

  _.each(connections[`/pubsub/${channel}`], (call, _id) => {
    logger.log('PubSub', 'publish', `${channel} to id=${_id}`);

    call(json);
  });
};

module.exports = route;
