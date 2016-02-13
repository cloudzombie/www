(function() {
  window.xyz = window.xyz || {};

  const DATE_MEDIUM = 'D MMM YYYY';
  const TIME_MEDIUM = 'HH:mm';
  const DATE_LONG = 'DD MMMM YYYY';
  const TIME_LONG = 'HH:mm:ss';

  const format = function(datetime, _fmt) {
    const date = moment(datetime);

    const ntf = function(fmt) {
      return window.xyz.NumberText.format(date.format(fmt));
    };

    const formatTextDate = function() {
      const century = window.xyz.NumberText.format(Math.floor(date.year() / 100));

      return `${ntf('D')} ${date.format('MMMM')} ${century} ${ntf('YY')}`;
    };

    const formatTextTime = function() {
      let min = date.format('mm');

      if (min === '00') {
        min = `o'clock`;
      } else {
        min = `${min.indexOf('0') === 0 ? "o'" : ''}${window.xyz.NumberText.format(min)}`;
      }

      return `${ntf('h')} ${min} ${date.format('a')}`;
    };

    let fmt = _fmt;

    fmt = fmt.replace(/\(countdown\)/g, () => `[${date.utcOffset(0).format(TIME_MEDIUM)}]`);
    fmt = fmt.replace(/\(countdownLong\)/g, () => `[${date.utcOffset(0).format(TIME_LONG)}]`);
    fmt = fmt.replace(/\(elapsed\)/g, () => `[${date.fromNow()}]`);
    fmt = fmt.replace(/\(remaining\)/g, () => `[${date.fromNow()}]`);
    fmt = fmt.replace(/\(textDate\)/g, () => `[${formatTextDate()}]`);
    fmt = fmt.replace(/\(textTime\)/g, () => `[${formatTextTime()}]`);
    fmt = fmt.replace(/\(text\)/g, () => `[${formatTextDate()} ${formatTextTime()}]`);
    fmt = fmt.replace(/\(longDate\)/g, DATE_LONG);
    fmt = fmt.replace(/\(longTime\)/g, TIME_LONG);
    fmt = fmt.replace(/\(long\)/g, `${DATE_LONG} ${TIME_LONG}`);
    fmt = fmt.replace(/\(mediumDate\)/g, DATE_MEDIUM);
    fmt = fmt.replace(/\(mediumTime\)/g, TIME_MEDIUM);
    fmt = fmt.replace(/\(medium\)/g, `${DATE_MEDIUM} ${TIME_MEDIUM}`);

    return date.format(fmt);
  };

  window.xyz.Datetime = {
    properties: {
      datetime: {
        type: String,
        observer: '_setDateStr'
      },
      format: {
        type: String,
        value: '(medium)',
        observer: '_setDateStr'
      },
      date: {
        type: Date
      },
      datestr: {
        type: String
      }
    },

    _setDateStr: function() {
      this.datestr = format(this.datetime, this.format);
    },

    format: format
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-datetime',
    behaviors: [window.xyz.Datetime]
  });
})();
