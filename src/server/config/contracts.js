const argv = require('yargs').string([
  'contract-lottery'
]).argv;

module.exports = {
  lottery: {
    addr: process.env.CONTRACT_LOTTERY || argv['contract-lottery'],
    spec: require('../contracts/lottery/lottery.json')
  }
};
