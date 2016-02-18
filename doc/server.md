## server

Some helpful reminders of what we need on our servers to actually get this going.

### packages

```
apt-get install -y curl git build-essential software-properties-common unzip python

curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
add-apt-repository -y ppa:ethereum/ethereum
add-apt-repository -y ppa:ethereum/ethereum-dev

apt-get update

apt-get install -y nodejs
apt-get install -y ethereum

bash <(curl https://get-parity.ethcore.io -Lk)

mkdir -p /www
```
