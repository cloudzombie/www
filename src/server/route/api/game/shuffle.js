const router = require('express').Router(); // eslint-disable-line new-cap

const responder = require('../../../lib/responder');
const shuffle = require('../../../game/shuffle');

router.get('/', (req, res, next) => {
  responder.promise(res, next, shuffle.get);
});

module.exports = router;
