#!/bin/bash

source bin/_setenv.sh

geth \
  --rpc \
  --unlock $ADDR_COINBASE_LVE \
  --password .password.$ADDR_COINBASE_LVE
