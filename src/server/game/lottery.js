const channels = require('../config/channels').lottery;
const contract = require('../config/contracts').lottery;
const geth = require('../lib/geth');
const logger = require('../lib/logger');
const pubsub = require('../route/pubsub');

const lottery = contract.addr ? geth.getContract(contract) : null;

if (!lottery) {
  logger.error('Lottery', 'init', 'invalid contract value, address not set');
  module.exports = {
    init: function() { return {}; },
    get: function() { return {}; }
  };
} else {
  const CONFIG_MIN_PLAYERS = lottery.CONFIG_MIN_PLAYERS(); // eslint-disable-line new-cap
  const CONFIG_MAX_PLAYERS = lottery.CONFIG_MAX_PLAYERS(); // eslint-disable-line new-cap
  const CONFIG_MAX_TICKETS = lottery.CONFIG_MAX_TICKETS(); // eslint-disable-line new-cap
  const CONFIG_PRICE = lottery.CONFIG_PRICE(); // eslint-disable-line new-cap
  const CONFIG_FEES = lottery.CONFIG_FEES(); // eslint-disable-line new-cap
  const CONFIG_MIN_VALUE = lottery.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
  const CONFIG_MAX_VALUE = lottery.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
  const CONFIG_RETURN = lottery.CONFIG_RETURN(); // eslint-disable-line new-cap
  const CONFIG_DURATION = lottery.CONFIG_DURATION(); // eslint-disable-line new-cap
  const CONFIG_ABI = JSON.stringify(contract.spec.interface);
  const CONFIG = {
    addr: contract.addr,
    price: CONFIG_PRICE.toString(),
    fees: CONFIG_FEES.toString(),
    return: CONFIG_RETURN.toString(),
    min: CONFIG_MIN_VALUE.toString(),
    max: CONFIG_MAX_VALUE.toString(),
    duration: geth.toTime(CONFIG_DURATION),
    minplayers: CONFIG_MIN_PLAYERS.toNumber(),
    maxplayers: CONFIG_MAX_PLAYERS.toNumber(),
    maxtickets: CONFIG_MAX_TICKETS.toNumber(),
    abi: CONFIG_ABI
  };

  let winner;
  let players = [];

  const getConfig = function() {
    return CONFIG;
  };

  const getRound = function() {
    const numplayers = lottery.numplayers().toNumber();
    const numtickets = lottery.numtickets().toNumber();

    return {
      txs: lottery.txs().toNumber(),
      round: lottery.round().toNumber(),
      players: numplayers,
      tickets: numtickets,
      value: CONFIG_PRICE.times(numtickets).toString(),
      start: geth.toTime(lottery.start()),
      end: geth.toTime(lottery.end())
    };
  };

  const get = function() {
    return {
      config: getConfig(),
      round: getRound(),
      players: players,
      winner: winner
    };
  };

  const getBalance = function() {
    const balance = geth.getBalance(contract.addr);
    const returns = CONFIG_RETURN.times(lottery.numtickets());

    return {
      balance: balance.toString(),
      fees: balance.minus(returns).toString()
    };
  };

  const addPlayer = function(player) {
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

  const ownerWithdraw = function(owner) {
    return lottery.ownerWithdraw.sendTransaction({ from: owner, to: contract.addr });
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

    pubsub.publish(channels.player, _player);
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

  const handleEvents = function(error, data) {
    if (error) {
      logger.error('Lottery', 'watch', error);
      return;
    }

    switch (data.event) {
      case 'Player': eventPlayer(data); break;
      case 'Winner': eventWinner(data); break;
      default:
        logger.error('Lottery', 'watch', `Unknown event ${data.event}`);
    }
  };

  const init = function() {
    geth.startEvents(contract.addr, contract.spec.interface, geth.getEventBlock(), handleEvents);
  };

  module.exports = {
    get: get,
    getBalance: getBalance,
    getRound: getRound,
    ownerWithdraw: ownerWithdraw,
    init: init
  };
}
