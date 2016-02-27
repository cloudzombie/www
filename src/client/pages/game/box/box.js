(function() {
  window.xyz = window.xyz || {};

  window.xyz.GameBox = {
    properties: {
    },

    addPlayers: function(players) {
      _.each(players, (player) => {
        if (!this.current || player.txs > this.current.txs) {
          this.current = {
            txs: player.txs,
            paid: player.paid,
            pool: window.xyz.NumberWei.formatMax(player.pool),
            turnover: window.xyz.NumberWei.formatMax(player.turnover)
          };
        }

        if (player.paid && (!this.winner || player.txs > this.winner.txs)) {
          this.winner = player;
        }

        player.payout = player.sender !== player.receiver;

        for (let idx = 0; idx < this.players.length; idx++) {
          const _player = this.players[idx];

          if (player.addr === _player.addr && player.txhash === _player.txhash) {
            return;
          }

          if (player.txs > _player.txs) {
            this.splice('players', idx, 0, player);
            return;
          }
        }

        this.splice('players', this.players.length, 0, player);
      });

      if (this.players.length > 15) {
        this.splice('players', 15, this.players.length - 15);
      }
    },

    setConfig: function(config) {
      config.edge = (config.edge * 100.0).toFixed(2);

      this.config = config;
    },

    subscribe: function() {
      this.$.pubsub.subscribe('game/box/player', (player) => {
        if (!player.txs) {
          return;
        }

        console.log('Player', player);
        this.addPlayers([player]);
      });
    },

    getGame: function() {
      this.$.api
        .get('game/box')
        .then((game) => {
          console.log('game', game);

          game.current.turnover = window.xyz.NumberWei.formatMax(game.current.turnover);
          game.current.pool = window.xyz.NumberWei.formatMax(game.current.pool);
          this.current = game.current;

          this.addPlayers(game.players);
          this.setConfig(game.config);

          this.subscribe();
        })
        .catch((error) => {
          console.log('error', error);
          this.getGame();
        });
    },

    ready: function() {
      this.getGame();
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-box',
    behaviors: [window.xyz.Page, window.xyz.Game, window.xyz.GameBox]
  });
})();
