const router = require('express').Router(); // eslint-disable-line new-cap

const api = require('./api');
const statics = require('./static');
const uptime = require('./uptime');

router.get('/admin/*', statics);
router.get('/game/*', statics);

router.use('/uptime', uptime);
router.use('/api', api);

module.exports = router;
