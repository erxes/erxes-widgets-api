# erxes API

The GraphQL server shared by the erxes apps and widgets.

## Status  <br>

![Build Status](https://travis-ci.org/erxes/erxes-widgets-api.svg?branch=master)

## Running the server

#### 1. Node (version >= 4) and NPM need to be installed.
#### 2. Clone and install dependencies.

```Shell
git clone https://github.com/erxes/erxes-widgets-api
cd erxes-widgets-api
yarn install
```

#### 3. Create configuration. We use [dotenv](https://github.com/motdotla/dotenv) for this.

```Shell
cp .env.sample .env
```

`MONGO_URL` in the `.env` file points to the mongo database instance of the [erxes](https://github.com/erxes/erxes) meteor app. So we need to run [erxes](https://github.com/erxes/erxes) app first.

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
