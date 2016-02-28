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

export ADDR_STANGERS_DEV=0xde7d5ce4238a7cbcd0b218425b4a009c2926af1c
export ADDR_STANGERS_TST=
export ADDR_STANGERS_LVE=

export ADDR_DICE_DEV=0xae9fbebe45af7306e9f207af0a22cd2d67db74db
export ADDR_DICE_TST=0x884054bebf354b55e9f737f38235a1137f85b14e
export ADDR_DICE_LVE=0x6d805b5de59d3f1779e4180b8547bcf728ff91ea

export ADDR_FIFTY_DEV=0x5263a93563b2413b11a73b7f93c3a41fc024de59
export ADDR_FIFTY_TST=0x0718a6ee3a97108c6eefc041b52f31f000408482
export ADDR_FIFTY_LVE=0xa96f7d29dc792359b1ce24c7c54230882dee1be2

export ADDR_LOTTERY_DEV=0x03a094e07af59bb9a8c999fadb8c7f7a750c2e03
export ADDR_LOTTERY_TST=0x967be93fd39b8eeecafff7b917ad1a342735a2af
export ADDR_LOTTERY_LVE=0x2ef76694fbfd691141d83f921a5ba710525de9b0

export SERVICE_TMPL="[Unit]\nDescription=www service\n\n[Install]\nWantedBy=multi-user.target\n\n[Service]\nKillMode=process\nRestart=on-failure\nRestartSec=15s\nExecReload=/bin/kill -HUP \\\$MAINPID\n"

export MONITOR_KEY=a38e1e50b1b82fa
export MONITOR_SERVER=wss://rpc.ethstats.net
export MONITOR_INSTANCE=the.looney.farm
export MONITOR_CONTACT=http://the.looney.farm
