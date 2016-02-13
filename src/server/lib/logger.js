const cluster = require('cluster');
const colors = require('colors/safe');

// colors.enabled = process.env.NODE_ENV !== 'production';

const fmtPrefix = function(_prefix, _func) {
  const number = `   ${cluster.isMaster ? 'M' : 'C'}${cluster.isMaster ? '' : cluster.worker.id}`.slice(-4);
  const prefix = `          ${_prefix}`.slice(-10);
  const func = `${_func}                    `.substr(0, 19);

  return ` ${number} ${prefix}.${func} : `;
};

const error = function(prefix, func, message) {
  console.error(colors.bgRed.white(fmtPrefix(prefix, func)), message);
};

const log = function(prefix, func, message) {
  console.log(colors.bgBlue.white(fmtPrefix(prefix, func)), message);
};

module.exports = {
  error: error,
  log: log
};
