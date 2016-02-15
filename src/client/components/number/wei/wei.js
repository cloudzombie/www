(function() {
  window.xyz = window.xyz || {};

  const UNITS = ['wei', 'Kwei', 'Mwei', 'Gwei', 'szabo', 'finney', 'ether'];

  const formatMax = function(number) {
    let unitidx = 0;
    let value = number;

    while (value.length > 3 && unitidx < UNITS.length - 1) {
      value = value.substr(0, value.length - 3);
      unitidx++;
    }

    return { value: value, unit: UNITS[unitidx] };
  };

  const format = function(number) {
    let unitidx = 0;
    let exhausted = false;
    let value = number;

    while (!exhausted && unitidx < UNITS.length - 1) {
      if (value.slice(-3) === '000') {
        value = value.substr(0, value.length - 3);
        unitidx++;
      } else {
        exhausted = true;
      }
    }

    if (unitidx !== UNITS.length - 1) {
      if (value.length > 3 && value.slice(-1) === '0') {
        value = (parseInt(value, 10) / 1000.0).toFixed(2);
        unitidx++;
      }
    }

    return { value: value, unit: UNITS[unitidx] };
  };

  window.xyz.NumberWei = {
    properties: {
      max: Boolean,
      number: {
        type: Number,
        observer: '_setWei'
      },
      wei: Object
    },

    _setWei: function() {
      this.wei = this.max ? formatMax(this.number) : format(this.number);
    },

    format: format,
    formatMax: formatMax
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-number-wei',
    behaviors: [window.xyz.NumberWei]
  });
})();
