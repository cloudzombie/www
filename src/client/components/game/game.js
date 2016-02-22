(function() {
  window.xyz = window.xyz || {};

  window.xyz.Game = {
    properties: {
      about: Boolean,
      winner: Object
    },

    sliceAddr: function(addr) {
      return `${addr.substring(0, 7)}...${addr.slice(-7)}`;
    },

    toggleAbout: function() {
      this.about = !this.about;
      this.toggleClass('about', this.about);
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
      this.toggleAbout();
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-game',
    behaviors: [window.xyz.Game]
  });
})();
