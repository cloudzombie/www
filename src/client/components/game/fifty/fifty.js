(function() {
  window.xyz = window.xyz || {};

  window.xyz.GameFifty = {
    properties: {
      config: Object,
      current: Object,
      winner: Object,
      players: {
        type: Array,
        value: function() {
          return [];
        }
      }
    },

    lastColor: function(winner) {
      return winner && winner.winner ? 'green' : 'red';
    },

    addPlayers: function(players) {
      _.each(players, (player) => {
        const input = new BigNumber(player.input);
        const output = new BigNumber(player.output);

        player.result = output.minus(input).toString();

        if (!this.current || player.txs > this.current.txs) {
          const turnover = new BigNumber(player.txs).times(this.config.min).toString();
          const wei = window.xyz.NumberWei.format(turnover);

          this.current = {
            wins: player.wins,
            txs: player.txs,
            turnover: wei,
            ratio: player.ratio
          };
        }

        if (player.winner) {
          if (!this.winner || player.txs > this.winner.txs) {
            this.winner = player;
          }
        }

        console.log(player);

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

      if (this.players.length > 10) {
        this.splice('players', 10, this.players.length - 10);
      }

      console.log(this.last);
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

          this.winner = game.winner;

          this.setConfig(game.config);
          this.addPlayers(game.players);
        });
    },

    ready: function() {
      this.$.pubsub.subscribe('game/fifty/player', (player) => {
        if (!_.isNumber(player.at)) {
          return;
        }

        console.log('NextPlayer', player);

        this.addPlayers([player]);
      });

      this.getGame();
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-fifty',
    behaviors: [window.xyz.Page, window.xyz.GameFifty]
  });
})();
