const router = require('express').Router(); // eslint-disable-line new-cap
const os = require('os');

const responder = require('../lib/responder');

const CPU_FACTOR = 100 / os.cpus().length;

const fmtMb = function fmtMb(value) {
  return `${Math.floor(value / 1048576)}MB`;
};

const fmtLoad = function fmtLoad(load) {
  return `${(load * CPU_FACTOR).toFixed(2)}`;
};

const fmtTime = function fmtTime(time) {
  let uptime = Math.round(time);
  const upsec = uptime % 60;

  let upstr = `${upsec}s`;
  uptime = (uptime - upsec) / 60;

  if (uptime) {
    const upmin = uptime % 60;
    upstr = `${upmin}m ${upstr}`;
    uptime = (uptime - upmin) / 60;

    if (uptime) {
      const uphr = uptime % 24;
      upstr = `${uphr}h ${upstr}`;
      uptime = (uptime - uphr) / 24;

      if (uptime) {
        upstr = `${uptime}d ${upstr}`;
      }
    }
  }
  return upstr;
};

router.get('/', (req, res) => {
  const mem = process.memoryUsage();
  const load = os.loadavg();

  responder.success(res, {
    process: {
      uptime: fmtTime(process.uptime()),
      mem: {
        rss: fmtMb(mem.rss),
        total: fmtMb(mem.heapTotal),
        used: fmtMb(mem.heapUsed)
      }
    },
    os: {
      uptime: fmtTime(os.uptime()),
      mem: {
        total: fmtMb(os.totalmem()),
        used: fmtMb(os.totalmem() - os.freemem()),
        free: fmtMb(os.freemem())
      },
      load: {
        '1m': fmtLoad(load[0]),
        '5m': fmtLoad(load[1]),
        '15m': fmtLoad(load[2])
      }
    }
  });
});

module.exports = router;
