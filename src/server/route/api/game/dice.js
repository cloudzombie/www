const router = require('express').Router(); // eslint-disable-line new-cap

const responder = require('../../../lib/responder');
const dice = require('../../../game/dice');

router.get('/', (req, res, next) => {
  responder.promise(res, next, dice.get);
});

module.exports = router;
