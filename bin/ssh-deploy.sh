#!/bin/sh

source bin/_setenv.sh

if [ "$1" == "test" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_TST
  ADDR_LOTTERY=$ADDR_LOTTERY_TST
  GETH_PASS=$GETH_PASS_TST
  GETH_NET="--testnet"
elif [ "$1" == "live" ]; then
  ADDR_COINBASE=$ADDR_COINBASE_LVE
  ADDR_LOTTERY=$ADDR_LOTTERY_LVE
  GETH_PASS=$GETH_PASS_LVE
  GETH_NET=
else
  echo "Usage: $0 <dev|test|live>"
  exit
fi

GETH_PASS_FILE=".password.$ADDR_COINBASE"

SERVICE_EXEC_GETH="ExecStart=/usr/bin/geth --rpc --datadir /root/.ethereum --unlock $ADDR_COINBASE --password /root/$GETH_PASS_FILE $GETH_NET"
SERVICE_EXEC_NODE="WorkingDirectory=/www/dist\nExecStart=/usr/bin/nodejs server.js --port 80 --contract-lottery $ADDR_LOTTERY"

source bin/scp-dist.sh

echo "Executing remote commands"
ssh -i $TLF_KEY root@$TLF_HOST << DEPLOYEND
  echo "Changing to /www"
  cd /www
  echo

  echo "Unpacking archive"
  unzip -q -o ./dist.zip
  echo

  echo "Stopping systemd www*"
  systemctl stop wwwnode
  systemctl stop wwwgeth
  echo

  echo "Creating Geth password file"
  printf "$GETH_PASS\n" > /root/$GETH_PASS_FILE
  echo

  echo "Creating wwwgeth.service"
  printf "$SERVICE_TMPL$SERVICE_EXEC_GETH\n" > /lib/systemd/system/wwwgeth.service
  systemctl daemon-reload
  echo

  echo "Creating wwwnode.service"
  printf "$SERVICE_TMPL$SERVICE_EXEC_NODE\n" > /lib/systemd/system/wwwnode.service
  systemctl daemon-reload
  echo

  echo "Changing to /www/dist"
  cd /www/dist
  echo

  echo "Installing node modules"
  npm install --production
  echo

  echo "Restarting systemd www*"
  systemctl start wwwgeth
  systemctl start wwwnode
  echo
DEPLOYEND

echo "Deployment completed"
echo
