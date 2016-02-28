const router = require('express').Router(); // eslint-disable-line new-cap

const responder = require('../../../lib/responder');
const strangers = require('../../../game/strangers');

router.get('/', (req, res, next) => {
  responder.guard(res, next, strangers.get);
});

module.exports = router;
