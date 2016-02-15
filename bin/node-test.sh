#!/bin/sh

source bin/_setenv.sh

node dist/server.js \
  --port 3000 \
  --contract-fifty $ADDR_FIFTY_TST \
  --contract-lottery $ADDR_LOTTERY_TST
