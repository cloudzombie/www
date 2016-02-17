#!/bin/sh

source bin/_setenv.sh

if [ "$1" == "" ]; then
  echo "Usage: $0 <wwwnode|wwwgeth|wwwgethmon|...>"
  exit
fi

ssh -i $TLF_KEY root@$TLF_HOST << TAILEND
  journalctl --unit=$1 --follow
TAILEND
