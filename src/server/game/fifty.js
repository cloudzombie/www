const _ = require('lodash');

const channels = require('../config/channels').fifty;
const contract = require('../config/contracts').fifty;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const fifty = contract.addr ? geth.getContract(contract) : null;

if (!fifty) {
  logger.error('Fifty', 'init', 'invalid contract value, address not set');
  module.exports = {
    init: function() { return {}; },
    get: function() { return {}; }
  };
} else {
  const CONFIG_PRICE = fifty.CONFIG_PRICE(); // eslint-disable-line new-cap
  const CONFIG_MIN_VALUE = fifty.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
  const CONFIG_MAX_VALUE = fifty.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
  const CONFIG_MAX_TICKETS = fifty.CONFIG_MAX_TICKETS(); // eslint-disable-line new-cap
  const CONFIG_FEES_MUL = fifty.CONFIG_FEES_MUL(); // eslint-disable-line new-cap
  const CONFIG_FEES_DIV = fifty.CONFIG_FEES_DIV(); // eslint-disable-line new-cap
  const CONFIG_FEES_EDGE = CONFIG_FEES_MUL.toNumber() / CONFIG_FEES_DIV.toNumber();
  const CONFIG_ABI = JSON.stringify(contract.spec.interface);
  const CONFIG = {
    addr: contract.addr,
    price: CONFIG_PRICE.toString(),
    min: CONFIG_MIN_VALUE.toString(),
    max: CONFIG_MAX_VALUE.toString(),
    tickets: CONFIG_MAX_TICKETS.toNumber(),
    edge: CONFIG_FEES_EDGE,
    abi: CONFIG_ABI
  };

  let winner;
  let players = [];

  const addPlayer = function(player) {
    if (player.winner && (!winner || player.tkplays > winner.tkplays)) {
      winner = player;
    }

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

    pubsub.publish(channels.player, player);
  };

  const handleEvents = function(error, data) {
    if (error) {
      logger.error('Fifty', 'watch', error);
      return;
    }

    switch (data.event) {
      case 'Player': eventPlayer(data); break;
      default:
        logger.error('Fifty', 'watch', `Unknown event ${data.event}`);
    }
  };

  const init = function() {
    geth.startEvents(fifty, geth.getEventBlock(), handleEvents);
  };

  const ownerWithdraw = function(owner) {
    return fifty.ownerWithdraw.sendTransaction({ from: owner, to: contract.addr });
  };

  const getBalance = function() {
    const balance = geth.getBalance(contract.addr).toString();

    return {
      balance: balance
    };
  };

  module.exports = {
    init: init,
    get: get,
    getBalance: getBalance,
    ownerWithdraw: ownerWithdraw
  };
}
