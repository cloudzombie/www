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

  window.xyz.DatetimeElapsed = {
    properties: {
      format: {
        type: String,
        value: '(elapsed)'
      }
    },

    ready: function() {
      addInstance(this);
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-datetime-elapsed',
    behaviors: [window.xyz.Datetime, window.xyz.DatetimeElapsed]
  });
})();
