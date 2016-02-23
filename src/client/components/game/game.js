(function() {
  window.xyz = window.xyz || {};

  window.xyz.Game = {
    properties: {
      about: Boolean,
      abi: Boolean,
      current: Object,
      winner: Object,
      config: {
        type: Object,
        value: function() {
          return { min: '0', max: '0', addr: '0x00000...0000000' };
        }
      },
      players: {
        type: Array,
        value: function() {
          return [];
        }
      }
    },

    sliceAddr: function(addr) {
      return `${addr.substring(0, 7)}...${addr.slice(-7)}`;
    },

    toggleAbout: function() {
      this.about = !this.about;
      this.toggleClass('about', this.about);
    },

    toggleAbi: function() {
      this.abi = !this.abi;
      this.toggleClass('abi', this.abi);
    },

    getValue: function(val, def) {
      return val || def || '-';
    },

    hideZero: function(val) {
      return (!val || val === '0') ? 'hidden' : '';
    },

    lastColor: function(winner) {
      return winner && winner.winner ? 'green' : 'red';
    },

    ready: function() {
      this.current = null;
      this.winner = null;

      this.toggleAbout();
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game',
    behaviors: [window.xyz.Game]
  });
})();
