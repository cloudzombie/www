const _ = require('lodash');

const EVENTS = {
  dice: ['player'],
  fifty: ['player'],
  lottery: ['player', 'winner'],
  shuffle: ['player']
};
const EXPORTS = {};

_.each(EVENTS, (channels, owner) => {
  EXPORTS[owner] = {};
  _.each(channels, (channel) => {
    EXPORTS[owner][channel] = `game/${owner}/${channel}`;
  });
});

module.exports = EXPORTS;
