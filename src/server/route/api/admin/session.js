const router = require('express').Router(); // eslint-disable-line new-cap

const responder = require('../../lib/responder');

router.get('/', (req, res) => {
  responder.success(res, {});
});

router.post('/', (req, res) => {
  responder.success(res, {});
});

module.exports = router;
