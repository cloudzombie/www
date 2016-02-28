const logger = require('./logger');

const send = function(res, code, obj) {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');

  res.status(code).json(obj);
};

const error = function(res, err) {
  logger.error('responder', 'error', err);
  logger.error('responder', 'error', err.stack);

  send(res, err.status || 500, {
    error: {
      message: err.message,
      type: err.name
    }
  });
};

const success = function(res, obj) {
  send(res, 200, obj || {});
};

const guard = function(res, next, func) {
  try {
    success(res, func());
  } catch (err) {
    next(err);
  }
};

const promise = function(res, next, func) {
  func()
    .then((data) => {
      success(res, data);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  error: error,
  success: success,
  guard: guard,
  promise: promise
};
