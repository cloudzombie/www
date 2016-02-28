const _ = require('lodash');
const Promise = require('bluebird');

const channels = require('../config/channels').fifty;
const contract = require('../config/contracts').fifty;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const CONFIG = {
  addr: contract.addr,
  abi: JSON.stringify(contract.abi),
  version: geth.getVersion()
};

const methods = geth.attachAbi(contract);

let winner;
let players = [];

const addPlayer = function(player) {
  if (_.find(players, { tkplays: player.tkplays })) {
    return;
  }

  if (player.winner && (!winner || player.tkplays > winner.tkplays)) {
    winner = player;
  }

  pubsub.publish(channels.player, player);

  players.unshift(player);
  players = players.slice(0, 15);
};

const get = function() {
  return {
    config: CONFIG,
    winner: winner,
    players: players
  };
};

const eventPlayer = function(data) {
  const tkwins = data.args.tkwins.toNumber();
  const tklosses = data.args.tklosses.toNumber();
  const tkplays = tkwins + tklosses;

  if (!_.isNumber(tkplays) || !tkplays) {
    return;
  }

  const wins = data.args.wins.toNumber();
  const losses = data.args.losses.toNumber();
  const plays = wins + losses;
  const _winner = data.args.output.gt(data.args.input);

  const player = {
    addr: data.args.addr,
    at: geth.toTime(data.args.at),
    wins: wins,
    losses: losses,
    plays: plays,
    ratio: `${((wins * 100) / plays).toFixed(2)}%`,
    winner: _winner,
    input: data.args.input.toString(),
    output: data.args.output.toString(),
    tkwins: tkwins,
    tklosses: tklosses,
    tkplays: tkplays,
    tkratio: `${((tkwins * 100) / tkplays).toFixed(2)}%`,
    turnover: data.args.turnover.toString(),
    txhash: data.transactionHash
  };

  addPlayer(player);
};

const initConfig = function() {
  return Promise
    .all([
      methods.CONFIG_PRICE(), // eslint-disable-line new-cap
      methods.CONFIG_MIN_VALUE(), // eslint-disable-line new-cap
      methods.CONFIG_MAX_VALUE(), // eslint-disable-line new-cap
      methods.CONFIG_MAX_TICKETS(), // eslint-disable-line new-cap
      methods.CONFIG_FEES_MUL(), // eslint-disable-line new-cap
      methods.CONFIG_FEES_DIV() // eslint-disable-line new-cap
    ])
    .then((data) => {
      CONFIG.price = data[0].toString();
      CONFIG.min = data[1].toString();
      CONFIG.max = data[2].toString();
      CONFIG.tickets = data[3].toNumber();
      CONFIG.edge = data[4].toNumber() / data[5].toNumber();

      return CONFIG;
    });
};

const init = function() {
  return initConfig().then(() => {
    geth.startEvents(contract, (data) => {
      switch (data.event) {
        case 'Player': eventPlayer(data); break;
        default:
          logger.error('Fifty', 'watch', `Unknown event ${data.event}`);
      }
    });
  });
};

module.exports = {
  init: init,
  get: get
};
