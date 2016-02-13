#!/bin/bash

source bin/_setenv.sh

geth \
  --rpc \
  --unlock $ADDR_COINBASE_DEV \
  --password .password.$ADDR_COINBASE_DEV \
  --dev \
  --mine \
  --minerthreads 1
