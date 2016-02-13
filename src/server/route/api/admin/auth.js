const jwt = require('jsonwebtoken');

const admincfg = require('../../config/admin');
const jwtcfg = require('../../config/jwt');
const errors = require('../../lib/errors');

module.exports = function(req, res, next) {
  const throwAuth = function() {
    throw new errors.AuthenticateFailedError('Unauthorized');
  };

  const [prefix, token] = (req.headers.authorization || '').split(' ');

  switch (prefix) {
    case 'Basic':
      const auth = new Buffer(token, 'base64').toString();
      const [username, password] = auth.split(/:/);

      if (username !== admincfg.username || password !== admincfg.password) {
        throwAuth();
        break;
      }

      const jwttoken = jwt.sign({ admin: true }, jwtcfg.secret);
      res.setHeader('authorization', `Bearer ${jwttoken}`);
      next();
      break;

    case 'Bearer':
      jwt.verify(token, jwtcfg.secret, (err, decoded) => {
        if (err || !decoded.admin) {
          throwAuth();
          return;
        }
        next();
      });

      break;

    default:
      throwAuth();
      break;
  }
};
