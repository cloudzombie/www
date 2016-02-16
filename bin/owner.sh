#!/bin/sh

source bin/_setenv.sh

usage() {
  echo "Usage: $0 <dev|test|live> <fifty|lottery> [command]"
  echo "  [command] is pushed to --exec parameter"
  exit
}

if [ "$1" == "test" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_TST
  ADDR_FIFTY=$ADDR_FIFTY_TST
  ADDR_LOTTERY=$ADDR_LOTTERY_TST
elif [ "$1" == "live" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_OWN
  ADDR_FIFTY=$ADDR_FIFTY_LVE
  ADDR_LOTTERY=$ADDR_LOTTERY_LVE
elif [ "$1" == "dev" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_DEV
  ADDR_FIFTY=$ADDR_FIFTY_DEV
  ADDR_LOTTERY=$ADDR_LOTTERY_DEV
else
  usage
fi

if [ "$2" == "" ]; then
  usage
fi

node dist/owner.js \
  --owner $ADDR_COINBASE \
  --contract-fifty $ADDR_FIFTY \
  --contract-lottery $ADDR_LOTTERY \
  --game $2 \
  --exec $3
