(function() {
  window.xyz = window.xyz || {};

  window.xyz.PageMenu = {
    properties: {
      color: String,
      pages: Array,
      selected: {
        type: Number,
        value: 0
      }
    },

    ready: function() {
      const path = window.location.pathname;

      _.each(this.pages, (page, idx) => {
        if (page.url === path) {
          this.selected = idx;
          this.color = page.color;
        }
      });
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-page-menu',
    behaviors: [window.xyz.PageMenu]
  });
})();
