(function() {
  window.xyz = window.xyz || {};

  const AUTHTOKEN = 'xyzapiauth';

  window.xyz.Api = {
    get: function(path, params, headers) {
      return this._send('GET', path, params, null, headers);
    },

    post: function(path, data, headers) {
      return this._send('POST', path, null, data, headers);
    },

    _send: function(method, path, params, body, _headers) {
      const queryParts = _.map(params, (val, key) => {
        return `${key}=${window.encodeURIComponent(val)}`;
      });

      const query = queryParts.length ? `?${queryParts.join('&')}` : '';
      const url = `/api/${path}${query}`;

      const headers = _headers || {};
      const defhdrs = {
        'content-type': 'application/json',
        'authorization': window.localStorage.getItem(AUTHTOKEN)
      };

      _.each(defhdrs, (def, key) => {
        headers[key] = headers[key] || def;
      });

      const request = document.createElement('iron-request');
      return request
        .send({
          url: url,
          method: method,
          handleAs: 'json',
          headers: headers,
          body: body
        })
        .then((req) => {
          const res = req.response;
          const authtoken = request.xhr.getResponseHeader('authorization');

          if (authtoken) {
            window.localStorage.setItem(AUTHTOKEN, authtoken);
          }

          return res;
        })
        .catch((error) => {
          throw { // eslint-disable-line no-throw-literal
            code: request.xhr.status,
            message: request.xhr.statusText,
            error: error
          };
        });
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-api',
    behaviors: [window.xyz.Api]
  });
})();
