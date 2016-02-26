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
// const EVENT_MONITOR = 5 * 60000;

const web3 = new Web3();

let coinbase;
let blocknumber;

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

const deployContract = function(contract) {
  logger.log('Geth', 'deployContract', 'creating contract');

  const data = {
    from: coinbase,
    data: contract.spec.bytecode,
    gas: 3000000
  };

  web3.eth.contract(contract.spec.interface).new(data, (error, tx) => {
    if (error) {
      logger.error('Geth', 'deployContract', error);
      return;
    }

    if (tx && tx.address) {
      logger.log('Geth', 'deployContract', `mined as ${tx.address} with hash ${tx.transactionHash}`);
    }
  });
};

const getCoinbase = function() {
  return coinbase;
};

const getBlockNumber = function() {
  return blocknumber;
};

const getCurrentBlockNumber = function() {
  return web3.eth.blockNumber;
};

const getEventBlock = function() {
  return Math.max(0, blocknumber - (8640 / 2));
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
  return web3.eth.contract(contract.spec.interface).at(contract.addr);
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

const startEvents = function(addr, abi, fromBlock, handleEvents) {
  logger.log('Geth', 'startEvents', 'starting event watch');

  _.each(abi, (methodAbi) => {
    blockName(methodAbi);
  });

  const callbackLogs = function(logs) {
    _.each(logs, (log) => {
      const values = log.data.substr(2).match(/.{1,64}/g);

      _.each(log.topics, (topic) => {
        const data = [];
        const abiTopic = _.find(abi, { blockTopic: topic });

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

  let filterId = 0;

  const watch = function() {
    rpc('eth_getFilterChanges', [filterId]).then((data) => {
      callbackLogs(data.result);

      setTimeout(watch, WATCH_TIMER + Math.floor(Math.random() * WATCH_TIMER));
    }).catch((error) => {
      handleEvents(error);
    });
  };

  rpc('eth_newFilter', [{
    fromBlock: fromBlock,
    address: addr
  }]).then((data) => {
    filterId = data.result;
    return rpc('eth_getFilterLogs', [filterId]);
  }).then((data) => {
    callbackLogs(data.result);
    watch();
  });
};

const init = function() {
  const waitGeth = function(callback) {
    if (web3.isConnected()) {
      callback();
      return;
    }

    setTimeout(() => {
      waitGeth(callback);
    }, 500 + Math.ceil(Math.random() * 500));
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
      blocknumber = web3.eth.blockNumber;

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
  deployContract: deployContract,
  getBlockNumber: getBlockNumber,
  getCurrentBlockNumber: getCurrentBlockNumber,
  getEventBlock: getEventBlock,
  getContract: getContract,
  sendTransaction: sendTransaction,
  getCoinbase: getCoinbase,
  getBalance: getBalance,
  startEvents: startEvents,
  toHex: toHex,
  toWei: toWei,
  toTime: toTime
};
