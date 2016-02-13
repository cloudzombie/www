const router = require('express').Router(); // eslint-disable-line new-cap

router.use('/admin', require('./admin'));
router.use('/game', require('./game'));

module.exports = router;
