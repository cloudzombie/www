#!/bin/sh

source bin/_setenv.sh

if [ "$1" == "live" ]; then
  ADDR_SHUFFLE=$ADDR_SHUFFLE_LVE
  ADDR_DICE=$ADDR_DICE_LVE
  ADDR_FIFTY=$ADDR_FIFTY_LVE
  ADDR_LOTTERY=$ADDR_LOTTERY_LVE
elif [ "$1" == "test" ]; then
  ADDR_SHUFFLE=$ADDR_SHUFFLE_TST
  ADDR_DICE=$ADDR_DICE_TST
  ADDR_FIFTY=$ADDR_FIFTY_TST
  ADDR_LOTTERY=$ADDR_LOTTERY_TST
elif [ "$1" == "dev" ]; then
  ADDR_SHUFFLE=$ADDR_SHUFFLE_DEV
  ADDR_DICE=$ADDR_DICE_DEV
  ADDR_FIFTY=$ADDR_FIFTY_DEV
  ADDR_LOTTERY=$ADDR_LOTTERY_DEV
else
  echo "Usage: $0 <dev|test|live>"
  exit
fi

node dist/server.js \
  --port 3000 \
  --contract-dice $ADDR_DICE \
  --contract-fifty $ADDR_FIFTY \
  --contract-lottery $ADDR_LOTTERY \
  --contract-shuffle $ADDR_SHUFFLE
