#!/bin/sh

if [ ! -d .git ]; then
  echo 'Clone erxes repository and install its dependencies:'
  git clone https://github.com/erxes/erxes-api
  cd erxes-api
  git checkout feature-company
  yarn install
fi

#### 3. Create configuration. We use [dotenv](https://github.com/motdotla/dotenv) for this.

cp .env.sample .env

cat <<"EOF"
 -------------------------------------------------------------------------
 To get started:

 Run erxes which is an AI meets open source messaging platform for sales and marketing
 $ cd erxes/ && yarn start

 Run api which for erxes administration apps:
 $ cd erxes-app-api/ && yarn dev

 Run redis server
 $ redis-server

 Run widget which embedable widget scripts server for erxes
 $ cd erxes-widget/ && yarn dev

 Run erxes apps which graphQL API for erxes apps
 $ cd erxes-api/ && yarn dev
EOF
