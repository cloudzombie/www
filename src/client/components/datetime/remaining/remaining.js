(function() {
  window.xyz = window.xyz || {};

  const instances = [];

  const addInstance = function(instance) {
    instances.push(instance);
  };

  const updateInstances = function() {
    _.each(instances, (instance) => {
      instance._setDateStr();
    });
  };

  setInterval(updateInstances, 30000);

  window.xyz.DatetimeRemaining = {
    properties: {
      format: {
        type: String,
        value: '(remaining)'
      }
    },

    readt: function() {
      addInstance(this);
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-datetime-remaining',
    behaviors: [window.xyz.Datetime, window.xyz.DatetimeRemaining]
  });
})();
