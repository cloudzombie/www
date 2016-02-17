#!/bin/bash

source bin/_setenv.sh

$MINE="--mine --minerthreads 1"

if [ "$1" == "dev" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_DEV
  OPTS="--dev $MINE"
elif [ "$2" == "test" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_TST
  OPTS="--testnet $MINE"
elif [ "$2" == "live" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_LVE
  OPTS=
elif [ "$2" == "owner" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_OWN
  OPTS=
else
  echo "Usage: $0 <dev|test|live|owner>"
  exit
fi

geth \
  --rpc \
  --rpccorsdomain "http://localhost:8887" \
  --unlock $ADDR_COINBASE \
  --password .password.$ADDR_COINBASE \
  $OPTS
