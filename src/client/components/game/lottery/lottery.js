(function() {
  window.xyz = window.xyz || {};

  const web3 = new Web3();

  const toWei = function(number) {
    const [numstr, unit] = number.split(' ');

    return web3.toWei(numstr, unit);
  };

  window.xyz.GameLottery = {
    properties: {
      config: Object,
      current: Object,
      end: Number,
      players: {
        type: Array,
        value: function() {
          return [];
        }
      }
    },

    addPlayers: function(entries) {
      _.each(entries, (entry) => {
        if (!entry || !entry.tickets) {
          return;
        }

        entry.addr = this.sliceAddr(entry.addr);
        entry.value = new BigNumber(this.config.price).times(entry.tickets).toString();

        for (let idx = 0; idx < this.players.length; idx++) {
          const _entry = this.players[idx];

          if (entry.addr === _entry.addr && entry.txhash === _entry.txhash) {
            return;
          }

          const newround = entry.round > _entry.round;
          const newentry = (entry.round === _entry.round) && (entry.tktotal > _entry.tktotal);

          if (newround || newentry) {
            this.splice('players', idx, 0, entry);
            return;
          }
        }

        this.splice('players', this.players.length, 0, entry);
      });

      if (this.players.length > 10) {
        this.splice('players', 10, this.players.length - 10);
      }
    },

    setConfig: function(config) {
      config.edge = (100 * toWei(config.fees) / toWei(config.price)).toFixed(2);

      this.config = config;
    },

    setWinner: function(winner) {
      if (winner) {
        winner.addr = this.sliceAddr(winner.addr);
        winner.value = new BigNumber(this.config.price).times(winner.numtickets).toString();

        this.winner = winner;
      }
    },

    setRound: function(round) {
      const wei = window.xyz.NumberWei.format(round.value);

      round.poolval = wei.value;
      round.poolunit = wei.unit;

      this.current = round;
    },

    getGame: function() {
      this.$.api
        .get('game/lottery')
        .then((game) => {
          console.log('game', game);

          this.setConfig(game.config);
          this.setWinner(game.winner);
          this.setRound(game.round);
          this.addPlayers(game.players);
        });
    },

    getRound: function() {
      this.$.api
        .get('game/lottery/round')
        .then((round) => {
          console.log('round', round);

          this.setRound(round);
        });
    },

    ready: function() {
      this.toggleAbout();

      this.end = 0;
      this.config = { min: '0', max: '0', addr: '0x00000...0000000' };
      this.current = {};
      this.winner = {};

      this.$.pubsub.subscribe('game/lottery/player', (entry) => {
        console.log('Player', entry);

        if (entry.round === this.current.round) {
          const prevval = new BigNumber(this.current.value);
          const thisval = new BigNumber(this.config.price).times(entry.numtickets);

          if (thisval.gt(prevval)) {
            const wei = window.xyz.NumberWei.format(thisval.toString());

            this.set('current.poolval', wei.value);
            this.set('current.poolunit', wei.unit);
            this.set('current.value', thisval.toString());
            this.set('current.numtickets', entry.numtickets);
          }
        }

        this.addPlayers([entry]);
      });

      this.$.pubsub.subscribe('game/lottery/winner', (winner) => {
        console.log('Winner', winner);

        this.setWinner(winner);
        this.getRound();
      });

      this.getGame();
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-lottery',
    behaviors: [window.xyz.Page, window.xyz.Game, window.xyz.GameLottery]
  });
})();
