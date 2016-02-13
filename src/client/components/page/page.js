(function() {
  window.xyz = window.xyz || {};

  window.xyz.Page = {
    hiddenClass: function(obj, key) {
      return _.get(obj, key) ? 'hidden' : 'visible';
    },

    visibleClass: function(obj, key) {
      return _.get(obj, key) ? 'visible' : 'hidden';
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-page',
    behaviors: [window.xyz.Page]
  });
})();
