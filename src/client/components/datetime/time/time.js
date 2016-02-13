(function() {
  window.xyz = window.xyz || {};

  window.xyz.DatetimeTime = {
    properties: {
      datetime: {
        type: Object
      },
      format: {
        type: String,
        value: '(medium)',
        observer: '_formatChanged'
      },
      dtformat: {
        type: String,
        value: '(mediumTime)'
      }
    },

    _formatChanged: function() {
      let format;

      if (_.includes(this.format, '(long)')) {
        format = 'long';
      } else if (_.includes(this.format, '(text)')) {
        format = 'text';
      } else {
        format = 'medium';
      }

      this.dtformat = `(${format}Time)`;
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-datetime-time',
    behaviors: [window.xyz.DatetimeTime]
  });
})();
