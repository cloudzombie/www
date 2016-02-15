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

    lastColor: function(last) {
      return last && last.isWinner ? 'green' : 'red';
    },

    ready: function() {
      this.current = { txs: 0, precent: 0 };

      this.$.pubsub.subscribe('game/fifty/player', (player) => {
        if (!_.isNumber(player.at)) {
          return;
        }

        console.log('NextPlayer', player);

        if (player.txs > this.current.txs) {
          this.set('current.wins', player.wins);
          this.set('current.txs', player.txs);
          this.set('current.ratio', player.ratio);
        }

        const input = new BigNumber(player.input);
        const output = new BigNumber(player.output);

        player.isWinner = output.gt(input);
        this.last = player;
      });
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-fifty',
    behaviors: [window.xyz.Page, window.xyz.GameFifty]
  });
})();
