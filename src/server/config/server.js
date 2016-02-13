const argv = require('yargs').argv;

module.exports = {
  port: process.env.PORT || argv.port || 3000,
  cluster: true
};
