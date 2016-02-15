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

export ADDR_LOTTERY_DEV=0x2850a646d9382469eb8357bdc12f6372e54bb689
export ADDR_LOTTERY_TST=0xa6f0e7bd469c00776cd783650851fb43b8763716
export ADDR_LOTTERY_LVE=0xfe147b94a4ee2285db73d7897438a94a97be64c2

export ADDR_FIFTY_DEV=0x5fc41d7248c2ba63692042af8ece9b20e7965173
export ADDR_FIFTY_TST=
export ADDR_FIFTY_LVE=0x4973cdab39a4da2f7bf952bc5cc60bcbd09faea1

export SERVICE_TMPL="[Unit]\nDescription=www service\n\n[Install]\nWantedBy=multi-user.target\n\n[Service]\nKillMode=process\nRestart=on-failure\nRestartSec=15s\nExecReload=/bin/kill -HUP \\\$MAINPID\n"
