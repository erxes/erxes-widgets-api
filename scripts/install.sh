#!/bin/sh

echo 'Clone erxes-widgets-api repository and install its dependencies:'
git clone https://github.com/erxes/erxes-widgets-api.git
cd erxes-widgets-api
git checkout master
yarn install

echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes-widgets-api' ]; then
  cd ..
fi

echo 'Install erxes-widgets'
curl https://raw.githubusercontent.com/erxes/erxes-widgets/master/scripts/install.sh | sh
