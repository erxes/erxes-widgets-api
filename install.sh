#!/bin/sh

if [ ! -d .git ]; then
  echo 'Clone erxes repository and install its dependencies:'
  git clone https://github.com/erxes/erxes-api
  cd erxes-api
  yarn install
fi

#### 3. Create configuration. We use [dotenv](https://github.com/motdotla/dotenv) for this.

cp .env.sample .env
