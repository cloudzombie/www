const router = require('express').Router(); // eslint-disable-line new-cap

const responder = require('../../../lib/responder');
const box = require('../../../game/box');

router.get('/', (req, res, next) => {
  responder.guard(res, next, box.get);
});

module.exports = router;
