const _ = require('lodash');

const CONTRACTS = ['dice', 'fifty', 'lottery', 'shuffle'];
const EXPORTS = {};

const argv = require('yargs').string(_.map(CONTRACTS, (contract) => {
  return `contract-${contract}`;
})).argv;

_.each(CONTRACTS, (contract) => {
  EXPORTS[contract] = {
    addr: argv[`contract-${contract}`],
    abi: require(`../contracts/${contract}/${contract}.json`).interface
  };
});

module.exports = EXPORTS;
