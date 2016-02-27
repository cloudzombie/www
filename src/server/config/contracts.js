const argv = require('yargs').string([
  'contract-box', 'contract-dice', 'contract-fifty', 'contract-lottery'
]).argv;

module.exports = {
  box: {
    addr: process.env.CONTRACT_BOX || argv['contract-box'],
    abi: require('../contracts/box/box.json').interface
  },
  dice: {
    addr: process.env.CONTRACT_DICE || argv['contract-dice'],
    abi: require('../contracts/dice/dice.json').interface
  },
  fifty: {
    addr: process.env.CONTRACT_FIFTY || argv['contract-fifty'],
    abi: require('../contracts/fifty/fifty.json').interface
  },
  lottery: {
    addr: process.env.CONTRACT_LOTTERY || argv['contract-lottery'],
    abi: require('../contracts/lottery/lottery.json').interface
  }
};
