const router = require('express').Router(); // eslint-disable-line new-cap

router.use('/lottery', require('./lottery'));

module.exports = router;
