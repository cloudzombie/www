const argv = require('yargs').string([
  'contract-fifty', 'contract-lottery'
]).argv;

module.exports = {
  fifty: {
    addr: process.env.CONTRACT_FIFTY || argv['contract-fifty'],
    spec: require('../contracts/fifty/fifty.json')
  },
  lottery: {
    addr: process.env.CONTRACT_LOTTERY || argv['contract-lottery'],
    spec: require('../contracts/lottery/lottery.json')
  }
};
