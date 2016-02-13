#!/bin/bash

source bin/_setenv.sh

geth \
  --rpc \
  --unlock $ADDR_COINBASE_TST \
  --password .password.$ADDR_COINBASE_TST \
  --testnet \
  --mine \
  --minerthreads 1
