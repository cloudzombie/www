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
      last: Object,
      entries: {
        type: Array,
        value: function() {
          return [];
        }
      }
    },

    ready: function() {
      this.current = {};

      this.$.pubsub.subscribe('game/fifty/player', (player) => {
        console.log('NextPlayer', player);

        const wei = window.xyz.NumberWei.formatMax(player.pool);
        console.log(`pool=${wei.value} ${wei.unit}`);

        this.set('current.pool', player.pool);
        this.set('current.poolval', wei.value);
        this.set('current.poolunit', wei.unit);

        this.last = player;
      });
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-fifty',
    behaviors: [window.xyz.Page, window.xyz.GameFifty]
  });
})();
