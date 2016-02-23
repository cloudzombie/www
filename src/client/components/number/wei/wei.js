(function() {
  window.xyz = window.xyz || {};

  const UNITS = ['wei', 'ada', 'babbage', 'shannon', 'szabo', 'finney', 'ether', 'kether', 'mether', 'gether', 'tether'];

  const formatEther = function(number) {
    let unitidx = 7;
    let value = number.substr(0, number.length - 18);
    let decimal = number.substr(number.length - 18);

    while (value.length > 3 && unitidx < UNITS.length - 1) {
      decimal = value.substr(value.length - 3);
      value = value.substr(0, value.length - 3);
      unitidx++;
    }

    const float = parseFloat(`${value}.${decimal}`);
    let rvalue = float.toFixed(3);

    if (rvalue.substr(rvalue.length - 4) === '.000') {
      rvalue = float.toFixed(0);
    } else if (rvalue.substr(rvalue.length - 2) === '00') {
      rvalue = float.toFixed(1);
    } else if (rvalue.substr(rvalue.length - 2) === '0') {
      rvalue = float.toFixed(2);
    }

    return { value: rvalue, unit: UNITS[unitidx] };
  };

  const formatMax = function(number) {
    let unitidx = 0;
    let value = number;
    let decimal = '0';

    while (value.length > 3 && unitidx < UNITS.length - 1) {
      decimal = value.substr(value.length - 3);
      value = value.substr(0, value.length - 3);
      unitidx++;
    }

    const float = parseFloat(`${value}.${decimal}`);
    let rvalue = float.toFixed(3);

    if (rvalue.slice(-3) === '000') {
      rvalue = float.toFixed(0);
    }

    return { value: rvalue, unit: UNITS[unitidx] };
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
      ether: Boolean,
      number: {
        type: String,
        observer: '_setWei'
      },
      wei: Object
    },

    _setWei: function() {
      if (this.max) {
        this.wei = formatMax(this.number);
      } else if (this.ether) {
        this.wei = formatEther(this.number);
      } else {
        this.wei = format(this.number);
      }
    },

    format: format,
    formatMax: formatMax
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-number-wei',
    behaviors: [window.xyz.NumberWei]
  });
})();
