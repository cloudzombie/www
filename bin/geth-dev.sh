#!/bin/bash

source bin/_setenv.sh

geth \
  --rpc \
  --rpccorsdomain "http://localhost:8887" \
  --unlock $ADDR_COINBASE_DEV \
  --password .password.$ADDR_COINBASE_DEV \
  --dev \
  --mine \
  --minerthreads 1
