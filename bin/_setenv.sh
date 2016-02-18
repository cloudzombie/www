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

export ADDR_FIFTY_DEV=
export ADDR_FIFTY_TST=
export ADDR_FIFTY_LVE=0xa96f7d29dc792359b1ce24c7c54230882dee1be2

export ADDR_LOTTERY_DEV=
export ADDR_LOTTERY_TST=
export ADDR_LOTTERY_LVE=0x2ef76694fbfd691141d83f921a5ba710525de9b0

export SERVICE_TMPL="[Unit]\nDescription=www service\n\n[Install]\nWantedBy=multi-user.target\n\n[Service]\nKillMode=process\nRestart=on-failure\nRestartSec=15s\nExecReload=/bin/kill -HUP \\\$MAINPID\n"

export MONITOR_KEY=a38e1e50b1b82fa
export MONITOR_SERVER=wss://rpc.ethstats.net
export MONITOR_INSTANCE=the.looney.farm
export MONITOR_CONTACT=http://the.looney.farm
