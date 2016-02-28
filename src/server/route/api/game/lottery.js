const router = require('express').Router(); // eslint-disable-line new-cap

const responder = require('../../../lib/responder');
const lottery = require('../../../game/lottery');

router.get('/', (req, res, next) => {
  responder.promise(res, next, lottery.get);
});

router.get('/round', (req, res, next) => {
  responder.promise(res, next, lottery.getRound);
});

module.exports = router;
