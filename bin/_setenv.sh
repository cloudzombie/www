#!/bin/sh

# import our details (.gitignored details)
#     export TLF_HOST=<some ip>
#     export TLF_KEY=<some ssh key>
#
#     export GETH_PASS_DEV=<pass>
#     export GETH_PASS_TST=<pass>
#     export GETH_PASS_LVE=<pass>
source .setenv.sh

export ADDR_COINBASE_DEV=0x63cf90d3f0410092fc0fca41846f596223979195
export ADDR_COINBASE_TST=$ADDR_COINBASE_DEV
export ADDR_COINBASE_LVE=$ADDR_COINBASE_TST

export ADDR_LOTTERY_DEV=0x905b2ea4789b38742cc9f86eb54417130f8f7eee
export ADDR_LOTTERY_TST=0xa7099e3a181ef7b2150d25fb39037e397bb72ee6
export ADDR_LOTTERY_LVE=$ADDR_LOTTERY_TST

export SERVICE_TMPL="[Unit]\nDescription=www service\n\n[Install]\nWantedBy=multi-user.target\n\n[Service]\nKillMode=process\nRestart=on-failure\nRestartSec=15s\nExecReload=/bin/kill -HUP \\\$MAINPID\n"
