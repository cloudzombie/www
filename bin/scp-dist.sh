#!/bin/bash

source bin/_setenv.sh

echo  "Creating dist/"
gulp clean
gulp --minimize
echo

echo "Creating dist.zip"
rm -f ./dist.zip
zip -q -r ./dist.zip dist
echo

echo "Copying dist.zip"
scp -i $TLF_KEY ./dist.zip root@$TLF_HOST:/www
echo
