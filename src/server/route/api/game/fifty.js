const router = require('express').Router(); // eslint-disable-line new-cap

const responder = require('../../../lib/responder');
const fifty = require('../../../game/fifty');

router.get('/', (req, res, next) => {
  responder.guard(res, next, fifty.get);
});

module.exports = router;
