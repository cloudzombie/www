(function() {
  window.xyz = window.xyz || {};

  window.xyz.GameDice = {
    properties: {
      current: Object,
      config: Object,
      players: {
        type: Array,
        value: function() {
          return [];
        }
      }
    },

    addPlayers: function(players) {
      _.each(players, (player) => {
        const input = new BigNumber(player.input);
        const output = new BigNumber(player.output);

        player.addr = this.sliceAddr(player.addr);
        player.result = output.minus(input).toString();
        player.chance = (100.0 * player.chance).toFixed(2);

        if (!this.current || player.txs > this.current.txs) {
          this.current = {
            wins: player.wins,
            txs: player.txs,
            turnover: window.xyz.NumberWei.formatMax(player.turnover)
          };
        }

        if (player.winner) {
          if (!this.winner || player.txs > this.winner.txs) {
            this.winner = player;
          }
        }

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
    },

    setConfig: function(config) {
      config.edge = (config.edge * 100.0).toFixed(2);

      this.config = config;
    },

    getGame: function() {
      this.$.api
        .get('game/dice')
        .then((game) => {
          console.log('game', game);

          game.current.turnover = window.xyz.NumberWei.formatMax(game.current.turnover);
          this.current = game.current;

          if (game.winner) {
            game.winner.chance = (100.0 * game.winner.chance).toFixed(2);
            game.winner.addr = this.sliceAddr(game.winner.addr);
            this.winner = game.winner;
          }

          this.addPlayers(game.players);
          this.setConfig(game.config);
        });
    },

    ready: function() {
      this.config = { min: '0', max: '0', addr: '0x00000...0000000' };
      this.current = {};
      this.winner = {};

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
    behaviors: [window.xyz.Page, window.xyz.Game, window.xyz.GameDice]
  });
})();
