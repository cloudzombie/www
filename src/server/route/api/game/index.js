const router = require('express').Router(); // eslint-disable-line new-cap

router.use('/dice', require('./dice'));
router.use('/fifty', require('./fifty'));
router.use('/lottery', require('./lottery'));
router.use('/strangers', require('./strangers'));

module.exports = router;
