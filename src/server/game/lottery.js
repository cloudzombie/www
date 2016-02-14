const channels = require('../config/channels').lottery;
const contract = require('../config/contracts').lottery;
const geth = require('../lib/geth');
const pubsub = require('../route/pubsub');

const lottery = geth.getContract(contract);

const CONFIG_MIN_ENTRIES = lottery.CONFIG_MIN_ENTRIES(); // eslint-disable-line new-cap
const CONFIG_MAX_ENTRIES = lottery.CONFIG_MAX_ENTRIES(); // eslint-disable-line new-cap
const CONFIG_MAX_TICKETS = lottery.CONFIG_MAX_TICKETS(); // eslint-disable-line new-cap
const CONFIG_PRICE = lottery.CONFIG_PRICE(); // eslint-disable-line new-cap
const CONFIG_FEES = lottery.CONFIG_FEES(); // eslint-disable-line new-cap
const CONFIG_MIN_VALUE = lottery.CONFIG_MIN_VALUE(); // eslint-disable-line new-cap
const CONFIG_MAX_VALUE = lottery.CONFIG_MAX_VALUE(); // eslint-disable-line new-cap
const CONFIG_RETURN = lottery.CONFIG_RETURN(); // eslint-disable-line new-cap
const CONFIG_DURATION = lottery.CONFIG_DURATION(); // eslint-disable-line new-cap
const CONFIG = {
  addr: contract.addr,
  price: CONFIG_PRICE.toString(),
  fees: CONFIG_FEES.toString(),
  return: CONFIG_RETURN.toString(),
  min: CONFIG_MIN_VALUE.toString(),
  max: CONFIG_MAX_VALUE.toString(),
  duration: geth.toTime(CONFIG_DURATION),
  minentries: CONFIG_MIN_ENTRIES.toNumber(),
  maxentries: CONFIG_MAX_ENTRIES.toNumber(),
  maxtickets: CONFIG_MAX_TICKETS.toNumber()
};

let entries = [];

const getConfig = function() {
  return CONFIG;
};

const getRound = function() {
  const numentries = lottery.numentries().toNumber();
  const numtickets = lottery.numtickets().toNumber();

  return {
    txs: lottery.txs().toNumber(),
    round: lottery.round().toNumber(),
    entries: numentries,
    tickets: numtickets,
    value: CONFIG_PRICE.times(numtickets).toString(),
    start: geth.toTime(lottery.start()),
    end: geth.toTime(lottery.end())
  };
};

const getWinner = function() {
  const [addr, at, round, tickets] = lottery.winner();

  return {
    addr: addr,
    at: geth.toTime(at),
    round: round.toNumber(),
    tickets: tickets.toNumber()
  };
};

const enter = function() {
  return geth.sendTransaction({
    to: contract.addr,
    value: geth.toWei(500, 'finney'), // geth.toWei(100, 'finney') geth.toWei(1, 'ether')
    gas: 500000
  });
};

const get = function() {
  return {
    config: getConfig(),
    round: getRound(),
    entries: entries,
    winner: getWinner()
  };
};

const getAdmin = function() {
  const balance = geth.getBalance(contract.addr);
  const returns = CONFIG_RETURN.times(lottery.numtickets());

  return {
    balance: balance.toString(),
    fees: balance.minus(returns).toString()
  };
};

const deploy = function() {
  return geth.deployContract(contract);
};

const addEntry = function(entry) {
  let found = false;

  for (let idx = 0; !found && idx < entries.length; idx++) {
    const _entry = entries[idx];
    const newround = entry.round > _entry.round;
    const newentry = (entry.round === _entry.round) && (entry.total > _entry.total);

    if (newround || newentry) {
      entries.splice(idx, 0, entry);
      found = true;
    }
  }

  if (!found) {
    entries.splice(entries.length, 0, entry);
  }

  entries = entries.slice(0, 10);
};

const init = function() {
  geth.watch('Lottery', lottery.NewEntry, (data) => {
    if (!data.args.at) {
      return;
    }

    const entry = {
      addr: data.args.addr,
      at: geth.toTime(data.args.at),
      round: data.args.round.toNumber(),
      tickets: data.args.tickets.toNumber(),
      total: data.args.total.toNumber(),
      txhash: data.transactionHash
    };

    addEntry(entry);

    pubsub.publish(channels.entry, entry);
  });

  geth.watch('Lottery', lottery.NewWinner, (data) => {
    if (!data.args.at) {
      return;
    }

    const winner = {
      addr: data.args.addr,
      at: geth.toTime(data.args.at),
      round: data.args.round.toNumber(),
      tickets: data.args.tickets.toNumber(),
      txhash: data.transactionHash
    };

    pubsub.publish(channels.winner, winner);
  });
};

module.exports = {
  deploy: deploy,
  enter: enter,
  get: get,
  getAdmin: getAdmin,
  getRound: getRound,
  getWinner: getWinner,
  init: init
};
