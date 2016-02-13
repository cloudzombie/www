const _ = require('lodash');

const define = function(erropts) {
  const ExtError = function() {
    Error.apply(this, arguments);
  };

  ExtError.prototype = Object.create(Error.prototype);
  Object.setPrototypeOf(ExtError, Error);

  return class extends ExtError {
    constrcutor(message) {
      this.message = message;
      this.status = erropts.status;
      this.name = erropts.name;
      this.stack = new Error(message).stack;
    }
  };
};

_.each([
  { name: 'BadRequestError', status: 400 },
  { name: 'AuthenticateFailedError', status: 401 },
  { name: 'ForbiddenError', status: 403 },
  { name: 'NotFoundError', status: 404 },
  { name: 'ChecksumError', status: 422 },
  { name: 'UnknownError', status: 500 }
], (erropts) => {
  module.exports[erropts.name] = define(erropts);
});
