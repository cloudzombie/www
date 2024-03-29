(function() {
  window.xyz = window.xyz || {};

  const format = function(number, fmt, drop) {
    if (!_.isNumber(number)) {
      return '';
    }

    if (fmt === '-text') {
      return window.xyz.NumberText.format(number);
    }

    const decimals = _.isNumber(fmt) ? fmt : _.parseInt(fmt);
    if (`${decimals}` !== `${fmt}`) {
      return '';
    }

    const fixed = number.toFixed(decimals);
    const parts = `${drop ? (fixed * 1) : fixed}`.split('.');
    const whole = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

    return parts[1] ? `${whole}.${parts[1]}` : whole;
  };

  window.xyz.Number = {
    properties: {
      number: {
        type: Number,
        observer: '_setNumberStr'
      },
      format: {
        type: String,
        value: '2',
        observer: '_setNumberStr'
      },
      numberstr: {
        type: String
      }
    },

    _setNumberStr: function() {
      this.numberstr = format(this.number, this.format);
    },

    format: format
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-number',
    behaviors: [window.xyz.Number]
  });
})();
