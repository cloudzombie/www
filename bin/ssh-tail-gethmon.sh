#!/bin/sh

source bin/_setenv.sh

ssh -i $TLF_KEY root@$TLF_HOST << TAILEND
  journalctl --unit=wwwgethmon --follow
TAILEND
