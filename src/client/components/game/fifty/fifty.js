(function() {
  window.xyz = window.xyz || {};

  const web3 = new Web3();

  const toWei = function(number) {
    const [numstr, unit] = number.split(' ');

    return web3.toWei(numstr, unit);
  };

  window.xyz.GameFifty = {
    properties: {
      config: Object,
      current: Object,
      entries: {
        type: Array,
        value: function() {
          return [];
        }
      }
    },

    ready: function() {
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-fifty',
    behaviors: [window.xyz.Page, window.xyz.GameFifty]
  });
})();
