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
export ADDR_COINBASE_LVE=0xbf885e2b55c6bcc84556a3c5f07d3040833c8d00

export ADDR_LOTTERY_DEV=0x905b2ea4789b38742cc9f86eb54417130f8f7eee
export ADDR_LOTTERY_TST=0x3a07c9bb35879c0d949fff5d123e66f23d049961
export ADDR_LOTTERY_LVE=$ADDR_LOTTERY_TST

export SERVICE_TMPL="[Unit]\nDescription=www service\n\n[Install]\nWantedBy=multi-user.target\n\n[Service]\nKillMode=process\nRestart=on-failure\nRestartSec=15s\nExecReload=/bin/kill -HUP \\\$MAINPID\n"
