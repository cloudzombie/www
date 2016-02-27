const argv = require('yargs').string([
  'contract-box', 'contract-dice', 'contract-fifty', 'contract-lottery'
]).argv;

module.exports = {
  box: {
    addr: process.env.CONTRACT_BOX || argv['contract-box'],
    spec: require('../contracts/box/box.json')
  },
  dice: {
    addr: process.env.CONTRACT_DICE || argv['contract-dice'],
    spec: require('../contracts/dice/dice.json')
  },
  fifty: {
    addr: process.env.CONTRACT_FIFTY || argv['contract-fifty'],
    spec: require('../contracts/fifty/fifty.json')
  },
  lottery: {
    addr: process.env.CONTRACT_LOTTERY || argv['contract-lottery'],
    spec: require('../contracts/lottery/lottery.json')
  }
};
