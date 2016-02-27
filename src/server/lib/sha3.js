// implementation idea from web3.js, no hex encoding though

const sha3 = require('crypto-js/sha3');

module.exports = function(value) {
  return sha3(value, { outputLength: 256 }).toString();
};
