(function() {
  window.xyz = window.xyz || {};

  window.xyz.GameFifty = {
    properties: {
    },

    addPlayers: function(players) {
      _.each(players, (player) => {
        const input = new BigNumber(player.input);
        const output = new BigNumber(player.output);

        player.addr = this.sliceAddr(player.addr);
        player.result = output.minus(input).toString();

        if (!this.current || player.tkplays > this.current.tkplays) {
          const wei = window.xyz.NumberWei.formatMax(player.turnover);

          this.current = {
            tkwins: player.tkwins,
            tkplays: player.tkplays,
            tkratio: player.tkratio,
            turnover: wei
          };
        }

        if (player.winner) {
          if (!this.winner || player.tkplays > this.winner.tkplays) {
            this.winner = player;
          }
        }

        for (let idx = 0; idx < this.players.length; idx++) {
          const _player = this.players[idx];

          if (player.addr === _player.addr && player.txhash === _player.txhash) {
            return;
          }

          if (player.tkplays > _player.tkplays) {
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
      config.edge = (config.edge * 100).toFixed(2);
      this.config = config;
    },

    getGame: function() {
      this.$.api
        .get('game/fifty')
        .then((game) => {
          console.log('game', game);

          if (game.winner) {
            game.winner.addr = this.sliceAddr(game.winner.addr);
            this.winner = game.winner;
          }

          this.setConfig(game.config);
          this.addPlayers(game.players);
        });
    },

    ready: function() {
      this.$.pubsub.subscribe('game/fifty/player', (player) => {
        if (!player.tkplays) {
          return;
        }

        console.log('Player', player);

        this.addPlayers([player]);
      });

      this.getGame();
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-fifty',
    behaviors: [window.xyz.Page, window.xyz.Game, window.xyz.GameFifty]
  });
})();
