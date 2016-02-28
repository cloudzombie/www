const _ = require('lodash');

const cluster = require('cluster');
const Promise = require('bluebird');
const request = require('request-promise');
const BigNumber = require('bignumber.js');

const config = require('../config/geth');
const logger = require('./logger');
const sha3 = require('./sha3');

const CONNECTION = `http://${config.host}:${config.port}`;
const WATCH_TIMER = 7000;
const EVENT_BLOCK_START = 8640;

let version;

let id = cluster.worker.id * 1000000;

const rpc = function(method, params) {
  id++;

  return request({
    method: 'POST',
    uri: CONNECTION,
    body: {
      jsonrpc: '2.0',
      method: method,
      params: params || [],
      id: id
    },
    json: true
  }).then((data) => {
    if (data.error) {
      throw data.error;
    }

    return data;
  }).catch((error) => {
    logger.error('Geth', method, error);

    throw error;
  });
};

const parseValues = function(input, types) {
  const values = input.substr(2).match(/.{1,64}/g);
  const result = [];

  let offset = 0;

  _.each(types, (type) => {
    if (type.type === 'address') {
      result.push(`0x${values[offset].slice(-40)}`);
    } else if (type.type === 'string') {
      const length = (new BigNumber(`0x${values[offset]}`)).toNumber();
      const blocks = Math.ceil(length / 64);

      let str = '';

      _.each(_.range(0, blocks), () => {
        offset++;

        _.each(values[offset].match(/.{1,2}/g), (byte) => {
          str = `${str}${String.fromCharCode(parseInt(byte, 10))}`;
        });
      });

      result.push(str);
    } else if (type.type === 'bytes') {
      const length = (new BigNumber(`0x${values[offset]}`)).toNumber();
      const blocks = Math.ceil(length / 64);

      const bytes = [];

      _.each(_.range(0, blocks), () => {
        offset++;

        _.each(values[offset].match(/.{1,2}/g), (byte) => {
          bytes.push(parseInt(byte, 10));
        });
      });

      result.push(bytes);
    } else {
      result.push(new BigNumber(`0x${values[offset]}`));
    }

    offset++;
  });

  return result;
};

const attachAbi = function(contract) {
  const methods = {};

  _.each(contract.abi, (method) => {
    const types = _.map(method.inputs, (input) => {
      return input.type;
    });

    method.blockName = `${method.name}(${types})`;
    method.blockTopic = `0x${sha3(method.blockName)}`;

    if (method.type === 'function') {
      methods[method.name] = function() {
        return rpc('eth_call', [{
          to: contract.addr,
          data: method.blockTopic.substr(0, 10)
        }, 'latest']).then((data) => {
          console.log(data, data.result, method.outputs);
          const result = parseValues(data.result, method.outputs);

          return result.length > 1 ? result : result[0];
        });
      };
    }
  });

  return methods;
};

const getVersion = function() {
  return version;
};

const toTime = function(number) {
  return number.toNumber() * 1000;
};

const ethBlockNumber = function() {
  return rpc('eth_blockNumber');
};

const ethGetLogs = function(fromBlock, addr) {
  return rpc('eth_getLogs', [{
    fromBlock: fromBlock,
    address: addr
  }]);
};

const web3ClientVersion = function() {
  return rpc('web3_clientVersion');
};

const startEvents = function(contract, handleEvents) {
  logger.log('Geth', 'startEvents', 'starting event watch');

  const callbackLogs = function(logs) {
    _.each(logs, (log) => {
      _.each(log.topics, (topic) => {
        const abiTopic = _.find(contract.abi, { blockTopic: topic });

        if (!abiTopic) {
          return;
        }

        if (abiTopic.type === 'event') {
          log.event = abiTopic.name;
          log.args = {};

          const values = parseValues(log.data, abiTopic.inputs);

          _.each(abiTopic.inputs, (input, idx) => {
            log.args[input.name] = values[idx];
          });

          handleEvents(log);
        }
      });
    });
  };

  const watch = function(offset) {
    const timeout = function() {
      setTimeout(watch, WATCH_TIMER + Math.floor(Math.random() * WATCH_TIMER));
    };

    ethBlockNumber()
      .then((data) => {
        const fromBlock = new BigNumber(`0x${data.result}`).toNumber() - (offset || 1);
        return ethGetLogs(fromBlock, contract.addr);
      })
      .then((data) => {
        callbackLogs(data.result);
        timeout();
      })
      .catch(() => {
        timeout();
      });
  };

  watch(EVENT_BLOCK_START);
};

const waitGeth = function() {
  return new Promise((resolve) => {
    const timeout = function(callback) {
      web3ClientVersion()
        .then((data) => {
          version = data.result;
          resolve();
        })
        .catch(() => {
          setTimeout(() => {
            timeout(callback);
          }, 100 + Math.ceil(Math.random() * 100));
        });
    };

    timeout();
  });
};

const init = function() {
  logger.log('Geth', 'init', `waiting on ${CONNECTION}`);

  return waitGeth().then(() => {
    logger.log('Geth', 'init', `found, version ${version}`);
  });
};

module.exports = {
  init: init,
  attachAbi: attachAbi,
  getVersion: getVersion,
  startEvents: startEvents,
  toTime: toTime
};
