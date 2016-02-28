#!/bin/sh

source bin/_setenv.sh

if [ "$1" == "live" ]; then
  ADDR_STANGERS=$ADDR_STANGERS_LVE
  ADDR_DICE=$ADDR_DICE_LVE
  ADDR_FIFTY=$ADDR_FIFTY_LVE
  ADDR_LOTTERY=$ADDR_LOTTERY_LVE
elif [ "$1" == "test" ]; then
  ADDR_STANGERS=$ADDR_STANGERS_TST
  ADDR_DICE=$ADDR_DICE_TST
  ADDR_FIFTY=$ADDR_FIFTY_TST
  ADDR_LOTTERY=$ADDR_LOTTERY_TST
elif [ "$1" == "dev" ]; then
  ADDR_STANGERS=$ADDR_STANGERS_DEV
  ADDR_DICE=$ADDR_DICE_DEV
  ADDR_FIFTY=$ADDR_FIFTY_DEV
  ADDR_LOTTERY=$ADDR_LOTTERY_DEV
else
  echo "Usage: $0 <dev|test|live>"
  exit
fi

node dist/server.js \
  --port 3000 \
  --contract-strangers $ADDR_STANGERS \
  --contract-dice $ADDR_DICE \
  --contract-fifty $ADDR_FIFTY \
  --contract-lottery $ADDR_LOTTERY
