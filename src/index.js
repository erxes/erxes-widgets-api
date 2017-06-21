/* eslint-disable no-console */

import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { connect } from './data/db/connection';
import { subscriptionManager } from './data/subscription-manager';
import schema from './data/schema';
import { markCustomerAsNotActive } from './data/utils';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use('/graphql', graphqlExpress({ schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

const server = createServer(app);
const { PORT } = process.env;

const SUBSCRIPTION_PATH = '/subscriptions';

server.listen(PORT, () => {
  console.log(`GraphQL server is running on port ${PORT}`);
  console.log(`Websocket server is running on port ${PORT}${SUBSCRIPTION_PATH}`);

  // eslint-disable-next-line no-new
  new SubscriptionServer(
    {
      subscriptionManager,
      onConnect(connectionParams, webSocket) {
        webSocket.on('message', message => {
          const parsedMessage = JSON.parse(message);

          if (parsedMessage.type === 'messengerConnected') {
            webSocket.messengerData = parsedMessage.value; // eslint-disable-line no-param-reassign
          }
        });
      },
      onDisconnect(webSocket) {
        const messengerData = webSocket.messengerData;

        if (messengerData) {
          markCustomerAsNotActive(messengerData.customerId);
        }
      },
    },
    {
      server,
      path: SUBSCRIPTION_PATH,
    },
  );
});
