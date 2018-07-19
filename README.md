# erxes Widgets-API

The GraphQL server shared by the erxes apps and widgets.

## Status  <br>

![Build Status](https://travis-ci.org/erxes/erxes-widgets-api.svg?branch=master)

## Running the server

#### 1. Node (version >= 4) and NPM need to be installed.
#### 2. Clone and install dependencies.

```Shell
git clone https://github.com/erxes/erxes-widgets-api.git
cd erxes-widgets-api
yarn install
```

#### 3. Create configuration from sample file. We use [dotenv](https://github.com/motdotla/dotenv) for this.

```Shell
cp .env.sample .env
```

.env file description

```env
NODE_ENV=development                        (Node environment: development | production)
PORT=3100                                   (Server port)
MAIN_API_URL=http://localhost:3300/graphql  (erxes-api project url)
MONGO_URL=mongodb://localhost/erxes         (MongoDB url)
```

#### 4. Start the server.

For development:

```Shell
yarn dev
```

For production:

```Shell
yarn build
yarn start
```

#### 5. Running servers:

- GraphQL server: [http://localhost:3100/graphql](http://localhost:3100/graphql)
- GraphiQL: [http://localhost:3100/graphiql](http://localhost:3100/graphiql)
- Subscription server (websocket): [http://localhost:3100/subscriptions](http://localhost:3100/subscriptions)
