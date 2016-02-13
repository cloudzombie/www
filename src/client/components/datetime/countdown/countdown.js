(function() {
  window.xyz = window.xyz || {};

  const instances = [];

  const addInstance = function(instance) {
    instances.push(instance);
  };

  setInterval(() => {
    _.each(instances, (instance) => {
      instance._datetimeChanged();
    });
  }, 999);

  window.xyz.DatetimeCountdown = {
    properties: {
      datetime: {
        type: Number,
        observer: '_datetimeChanged'
      },
      format: {
        type: String,
        value: '(countdown)',
        observer: '_formatChanged'
      },
      timer: {
        type: Number
      }
    },

    _formatChanged: function() {
      if (this.format === '(long)') {
        this.dtformat = '(countdownLong)';
      } else {
        this.dtformat = '(countdown)';
      }
    },

    _datetimeChanged: function() {
      this.timer = Math.max(0, this.datetime - Date.now());
    },

    ready: function() {
      addInstance(this);
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-datetime-countdown',
    behaviors: [window.xyz.DatetimeCountdown]
  });
})();
