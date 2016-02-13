(function() {
  window.xyz = window.xyz || {};

  window.xyz.AdminSession = {
    properties: {
      valid: {
        type: String,
        value: 'error',
        notify: true
      },
      toError: String
    },

    ready: function() {
      this.$.api
        .get('admin/session')
        .then(() => {
          this.status = 'ok';
        })
        .catch((err) => {
          console.error('err', err);
          window.location = `${this.toError || '/admin/login'}?from=${location.pathname}`;
        });
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-admin-session',
    behaviors: [window.xyz.AdminSession]
  });
})();
