const _ = require('lodash');
const Promise = require('bluebird');

const channels = require('../config/channels').lottery;
const contract = require('../config/contracts').lottery;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const CONFIG = {
  addr: contract.addr,
  abi: JSON.stringify(contract.abi)
};

const methods = geth.attachAbi(contract);

let winner;
let players = [];

const getRound = function() {
  return Promise
    .all([
      methods.txs(),
      methods.round(),
      methods.numplayers(),
      methods.numtickets(),
      methods.start(),
      methods.end()
    ])
    .then((data) => {
      return {
        txs: data[0].toNumber(),
        round: data[1].toNumber(),
        players: data[2].toNumber(),
        tickets: data[3].toNumber(),
        value: data[3].times(CONFIG.price).toString(),
        start: geth.toTime(data[4]),
        end: geth.toTime(data[5])
      };
    });
};

const get = function() {
  return getRound().then((round) => {
    return {
      config: CONFIG,
      round: round,
      players: players,
      winner: winner
    };
  });
};

const addPlayer = function(player) {
  if (_.find(players, { tktotal: player.tktotal })) {
    return;
  }

  pubsub.publish(channels.player, player);

  let found = false;

  for (let idx = 0; !found && idx < players.length; idx++) {
    const _player = players[idx];
    const newround = player.round > _player.round;
    const newplayer = (player.round === _player.round) && (player.tktotal > _player.tktotal);

    if (newround || newplayer) {
      players.splice(idx, 0, player);
      found = true;
    }
  }

  if (!found) {
    players.splice(players.length, 0, player);
  }

  players = players.slice(0, 15);
};

const eventPlayer = function(data) {
  const round = data.args.round && data.args.round.toNumber();

  if (!round) {
    return;
  }

  const _player = {
    addr: data.args.addr,
    at: geth.toTime(data.args.at),
    round: round,
    tickets: data.args.tickets.toNumber(),
    numtickets: data.args.numtickets.toNumber(),
    tktotal: data.args.tktotal.toNumber(),
    turnover: data.args.turnover.toString(),
    txhash: data.transactionHash
  };

  addPlayer(_player);
};

const eventWinner = function(data) {
  const round = data.args.round && data.args.round.toNumber();

  if (!round) {
    return;
  }

  const _winner = {
    addr: data.args.addr,
    at: geth.toTime(data.args.at),
    round: round,
    numtickets: data.args.numtickets.toNumber(),
    output: data.args.output.toString(),
    txhash: data.transactionHash
  };

  if (!winner || (_winner.round > winner.round)) {
    winner = _winner;
  }

  pubsub.publish(channels.winner, _winner);
};

const initConfig = function() {
  return Promise
    .all([
      methods.CONFIG_PRICE(), // eslint-disable-line new-cap
      methods.CONFIG_FEES(), // eslint-disable-line new-cap
      methods.CONFIG_RETURN(), // eslint-disable-line new-cap
      methods.CONFIG_MIN_VALUE(), // eslint-disable-line new-cap
      methods.CONFIG_MAX_VALUE(), // eslint-disable-line new-cap
      methods.CONFIG_DURATION(), // eslint-disable-line new-cap
      methods.CONFIG_MIN_PLAYERS(), // eslint-disable-line new-cap
      methods.CONFIG_MAX_PLAYERS(), // eslint-disable-line new-cap
      methods.CONFIG_MAX_TICKETS() // eslint-disable-line new-cap
    ])
    .then((data) => {
      CONFIG.price = data[0].toString();
      CONFIG.fees = data[1].toString();
      CONFIG.return = data[2].toString();
      CONFIG.min = data[3].toString();
      CONFIG.max = data[4].toString();
      CONFIG.duration = geth.toTime(data[5]);
      CONFIG.minplayers = data[6].toNumber();
      CONFIG.maxplayers = data[7].toNumber();
      CONFIG.maxtickets = data[8].toNumber();

      return CONFIG;
    });
};

const init = function() {
  initConfig().then(() => {
    geth.startEvents(contract, (data) => {
      switch (data.event) {
        case 'Player': eventPlayer(data); break;
        case 'Winner': eventWinner(data); break;
        default:
          logger.error('Lottery', 'watch', `Unknown event ${data.event}`);
      }
    });
  });
};

module.exports = {
  get: get,
  getRound: getRound,
  init: init
};
