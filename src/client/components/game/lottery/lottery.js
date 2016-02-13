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
      entries: {
        type: Array,
        value: function() {
          return [];
        }
      },
      end: Number,
      winner: Object
    },

    addEntries: function(entries) {
      _.each(entries, (entry) => {
        entry.value = new BigNumber(this.config.price).times(entry.tickets).toString();

        for (let idx = 0; idx < this.entries.length; idx++) {
          const _entry = this.entries[idx];
          const newround = entry.round > _entry.round;
          const newentry = (entry.round === _entry.round) && (entry.total > _entry.total);

          if (newround || newentry) {
            this.splice('entries', idx, 0, entry);
            return;
          }
        }

        this.splice('entries', this.entries.length, 0, entry);
      });

      if (this.entries.length > 10) {
        this.splice('entries', 10, this.entries.length - 10);
      }
    },

    setConfig: function(config) {
      config.edge = (100 * toWei(config.fees) / toWei(config.price)).toFixed(2);
      this.config = config;
    },

    setWinner: function(winner) {
      winner.value = new BigNumber(this.config.price).times(winner.tickets).toString();
      this.winner = winner;
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
          this.addEntries(game.entries);
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
      this.$.pubsub.subscribe('game/lottery/entry', (entry) => {
        console.log('NewEntry', entry);

        if (entry.round === this.current.round) {
          const prevval = new BigNumber(this.current.value);
          const thisval = new BigNumber(this.config.price).times(entry.total);

          if (thisval.gt(prevval)) {
            const wei = window.xyz.NumberWei.format(thisval.toString());

            this.set('current.poolval', wei.value);
            this.set('current.poolunit', wei.unit);
            this.set('current.value', thisval.toString());
            this.set('current.tickets', entry.total);
          }
        }

        this.addEntries([entry]);
      });

      this.$.pubsub.subscribe('game/lottery/winner', (winner) => {
        console.log('NewWinner', winner);

        this.setWinner(winner);
        this.getRound();
      });

      this.getGame();
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game-lottery',
    behaviors: [window.xyz.Page, window.xyz.GameLottery]
  });
})();
