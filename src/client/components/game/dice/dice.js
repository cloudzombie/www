(function() {
  window.xyz = window.xyz || {};

  window.xyz.GameDice = {
    properties: {
      config: Object
    },

    addPlayers: function(players) {

    },

    setConfig: function(config) {

    },

    getGame: function() {
      this.$.api
        .get('game/dice')
        .then((game) => {
          console.log('game', game);

          this.setConfig(game.config);
        });
    },

    ready: function() {
      this.$.pubsub.subscribe('game/dice/player', (player) => {
        if (!player.txs) {
          return;
        }

        console.log('Player', player);

        this.addPlayers([player]);
      });

      this.getGame();
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-dice',
    behaviors: [window.xyz.Page, window.xyz.GameDice]
  });
})();
