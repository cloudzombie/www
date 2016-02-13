(function() {
  window.xyz = window.xyz || {};

  let toSuccess = '';
  _.each(location.search.split('&'), (entry) => {
    const [key, val] = entry.split('=');
    if (key.indexOf('from') !== -1) {
      toSuccess = val;
    }
  });

  window.xyz.AdminLogin = {
    properties: {
      username: String,
      password: String,
      toSuccess: String
    },

    doLogin: function() {
      const token = btoa(`${this.username}:${this.password}`);

      this.$.api
        .post('admin/session', {}, {
          'authorization': `Basic ${token}`
        })
        .then(() => {
          window.location = this.toSuccess || toSuccess || '/admin';
        })
        .catch((err) => {
          console.error('err', err);
        });
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-admin-login',
    behaviors: [window.xyz.AdminLogin]
  });
})();
