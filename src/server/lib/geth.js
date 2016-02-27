const _ = require('lodash');

const cluster = require('cluster');
const Promise = require('bluebird');
const request = require('request-promise');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const config = require('../config/geth');
const logger = require('./logger');
const sha3 = require('./sha3');

const CONNECTION = `http://${config.host}:${config.port}`;
const WATCH_MONITOR = 30000;
const WATCH_TIMER = 7000;
const EVENT_BLOCK_START = 8640;

const web3 = new Web3();

let coinbase;

let id = cluster.worker.id * 1000000;

const blockName = function(methodAbi) {
  if (!methodAbi.blockName) {
    const types = _.map(methodAbi.inputs, (input) => {
      return input.type;
    });

    methodAbi.blockName = `${methodAbi.name}(${types})`;
  }

  methodAbi.blockTopic = `0x${sha3(methodAbi.blockName)}`;
  return methodAbi.blockName;
};

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
    return data;
  }).catch((error) => {
    logger.error('Geth', method, error);
    throw error;
  });
};

const getCoinbase = function() {
  return coinbase;
};

const getBalance = function(address) {
  return web3.eth.getBalance(address || coinbase);
};

const call = function(object) {
  object.from = object.from || coinbase;

  return web3.eth.call(object);
};

const sendTransaction = function(object) {
  object.from = object.from || coinbase;

  return web3.eth.sendTransaction(object);
};

const getContract = function(contract) {
  return web3.eth.contract(contract.abi).at(contract.addr);
};

const toHex = function(number) {
  return web3.toHex(number.toString());
};

const toWei = function(number, unit) {
  return web3.toWei(number, unit);
};

const toTime = function(number) {
  return number.toNumber() * 1000;
};

const ethBlockNumber = function() {
  return rpc('eth_blockNumber');
};

const ethGetLogs = function(fromBlock, addr) {
  return rpc('eth_getLogs', [{
    fromBlock: Math.max(1, fromBlock),
    address: addr
  }]);
};

const startEvents = function(contract, handleEvents) {
  logger.log('Geth', 'startEvents', 'starting event watch');

  _.each(contract.abi, blockName);

  const callbackLogs = function(logs) {
    _.each(logs, (log) => {
      const values = log.data.substr(2).match(/.{1,64}/g);

      _.each(log.topics, (topic) => {
        const data = [];
        const abiTopic = _.find(contract.abi, { blockTopic: topic });

        if (!abiTopic) {
          return;
        }

        let vidx = 0;

        _.each(abiTopic.inputs, () => {
          data.push(values[vidx]);
          vidx++;
        });

        if (abiTopic.type === 'event') {
          log.event = abiTopic.name;
          log.args = {};

          _.each(data, (value, idx) => {
            const input = abiTopic.inputs[idx];

            if (input.type === 'address') {
              log.args[input.name] = `0x${value.slice(-40)}`;
            } else {
              log.args[input.name] = new BigNumber(`0x${value}`);
            }
          });

          handleEvents(null, log);
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

const init = function() {
  const waitGeth = function(callback) {
    if (web3.isConnected()) {
      callback();
      return;
    }

    setTimeout(() => {
      waitGeth(callback);
    }, 100 + Math.ceil(Math.random() * 100));
  };

  const monitor = function() {
    if (web3.isConnected()) {
      setTimeout(monitor, WATCH_MONITOR + Math.ceil(Math.random() * WATCH_MONITOR));
      return;
    }

    logger.log('Geth', 'init', 'connection lost, re-initializing');

    process.exit(1);
  };

  return new Promise((resolve) => {
    logger.log('Geth', 'init', `initializing on ${CONNECTION}`);
    web3.setProvider(new web3.providers.HttpProvider(CONNECTION));

    waitGeth(() => {
      coinbase = web3.eth.coinbase;

      rpc('web3_clientVersion').then((data) => {
        logger.log('rpc', 'data=', data);
      });

      // monitor();

      logger.log('Geth', 'init', `initialized with coinbase ${coinbase}`);
      resolve();
    });
  });
};

module.exports = {
  init: init,
  call: call,
  getContract: getContract,
  sendTransaction: sendTransaction,
  getCoinbase: getCoinbase,
  getBalance: getBalance,
  startEvents: startEvents,
  toHex: toHex,
  toWei: toWei,
  toTime: toTime
};
