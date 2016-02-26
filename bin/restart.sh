#!/bin/sh

source bin/_setenv.sh

echo "Executing remote restart"
ssh -i $TLF_KEY root@$TLF_HOST << STARTEND
  echo "Stopping systemd www*"
  systemctl stop wwwgethmon
  systemctl stop wwwnode
  systemctl stop wwwgeth
  echo

  echo "Starting systemd www*"
  systemctl start wwwgeth
  systemctl start wwwnode
  systemctl start wwwgethmon
  echo
STARTEND

echo "Restart completed"
echo
