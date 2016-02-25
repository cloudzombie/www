#!/bin/sh

source bin/_setenv.sh

echo "Executing remote restart"
ssh -i $TLF_KEY root@$TLF_HOST << STARTEND
  echo "Stopping systemd www*"
  systemctl stop wwwgeth
  systemctl stop wwwnode
  echo

  echo "Starting systemd www*"
  systemctl start wwwgeth
  systemctl start wwwnode
  echo
STARTEND

echo "Restart completed"
echo
