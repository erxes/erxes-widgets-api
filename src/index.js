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

const { GRAPHQL_PORT } = process.env;
app.listen(GRAPHQL_PORT, () => {
  console.log(`GraphQL server is running on port ${GRAPHQL_PORT}`);
});

// websocket server
const httpServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});
const { WS_PORT } = process.env;
httpServer.listen(WS_PORT, () => {
  console.log(`Websocket server is running on port ${WS_PORT}`);
});

// subscription server
const server = new SubscriptionServer( // eslint-disable-line no-unused-vars
  { subscriptionManager },
  httpServer,
);

// receive inAppConnected message and save integrationId, customerId in connection
server.wsServer.on('connect', (connection) => {
  connection.on('message', (message) => {
    const parsedMessage = JSON.parse(message.utf8Data);

    if (parsedMessage.type === 'inAppConnected') {
      connection.inAppData = parsedMessage.value; // eslint-disable-line no-param-reassign
    }
  });
});

// mark customer as not active when connection close
server.wsServer.on('close', (connection) => {
  const inAppData = connection.inAppData;

  if (inAppData) {
    markCustomerAsNotActive(inAppData.customerId);
  }
});
