const router = require('express').Router(); // eslint-disable-line new-cap

router.use(require('./auth'));

router.use('/session', require('./session'));

module.exports = router;
