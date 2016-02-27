(function() {
  window.xyz = window.xyz || {};

  window.xyz.PubSub = {
    subscribe: function(channel, callback) {
      console.log('PubSub->subscribe', channel);

      if (!window.EventSource) {
        console.error('PubSub->subscribe', 'no window.EventSource');
        return;
      }

      const source = `/pubsub/${channel}`;
      const es = new EventSource(source);

      es.onopen = function() {
        console.log('PubSub->onopen', source);
      };

      es.onerror = function() {
        console.error('PubSub->onerror', event);
      };

      es.onmessage = function(event) {
        callback(JSON.parse(event.data).data);
      };
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-pubsub',
    behaviors: [window.xyz.PubSub]
  });
})();
