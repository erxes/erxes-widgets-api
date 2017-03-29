/* eslint-disable no-console */

import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { connectToMongo } from './data/connectors';
import { subscriptionManager } from './data/subscription-manager';
import schema from './data/schema';
import { markCustomerAsNotActive } from './data/utils';

// load environment variables
dotenv.config();

// connect to mongo database
connectToMongo();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use('/graphql', graphqlExpress({ schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// server
const server = createServer(app);
const { PORT } = process.env;
const SUBSCRIPTION_PATH = '/subscriptions';

server.listen(PORT, () => {
  console.log(`GraphQL server is running on port ${PORT}`);
  console.log(`Websocket server is running on port ${PORT}${SUBSCRIPTION_PATH}`);

  // subscription server
  const subscriptionServer = new SubscriptionServer(
    {
      subscriptionManager,
      onConnect(connectionParams, webSocket) {
        webSocket.on('message', (message) => {
          const parsedMessage = JSON.parse(message);

          console.log(parsedMessage);

          if (parsedMessage.type === 'inAppConnected') {
            webSocket.inAppData = parsedMessage.value; // eslint-disable-line no-param-reassign
          }
        });
      },
      onDisconnect(webSocket) {
        const inAppData = webSocket.inAppData;

        if (inAppData) {
          markCustomerAsNotActive(inAppData.customerId);
        }
      },
    },
    {
      server,
      path: SUBSCRIPTION_PATH,
    },
  );
});
