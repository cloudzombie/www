#!/bin/sh

source bin/_setenv.sh

if [ "$1" == "" ]; then
  echo "Usage: $0 <file>"
  exit
fi

FILE=$1

echo "Copying $FILE"
scp -i $TLF_KEY $FILE root@$TLF_HOST:/root
echo
