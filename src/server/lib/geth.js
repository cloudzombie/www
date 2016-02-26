const Promise = require('bluebird');
const Web3 = require('web3');

const config = require('../config/geth');
const logger = require('./logger');

const WATCH_MONITOR = 30000;
const EVENT_MONITOR = 5 * 60000;

const web3 = new Web3();

let coinbase;
let blocknumber;

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

const startEvents = function(contract, fromBlock, handleEvents) {
  logger.log('Geth', 'startEvents', 'starting event watch');

  const events = contract.allEvents({ fromBlock: fromBlock });
  events.watch(handleEvents);

  setTimeout(() => {
    events.stopWatching();
    startEvents(contract, getCurrentBlockNumber() - 5, handleEvents);
  }, EVENT_MONITOR + Math.ceil(Math.random() * EVENT_MONITOR));
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
    const connection = `http://${config.host}:${config.port}`;

    logger.log('Geth', 'init', `initializing on ${connection}`);
    web3.setProvider(new web3.providers.HttpProvider(connection));

    waitGeth(() => {
      coinbase = web3.eth.coinbase;
      blocknumber = web3.eth.blockNumber;

      monitor();

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
