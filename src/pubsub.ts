import { GooglePubSub } from '@axelspringer/graphql-google-pubsub';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Redis from 'ioredis';
import * as path from 'path';
import { IMessageDocument } from './db/models';

// load environment variables
dotenv.config();

interface IGoogleOptions {
  projectId: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
}

interface IPubsubData {
  trigger: string;
  type: string;
  payload: IMessageDocument;
}

const {
  PUBSUB_TYPE,
  REDIS_HOST = 'localhost',
  REDIS_PORT = 6379,
  REDIS_PASSWORD = '',
}: {
  PUBSUB_TYPE?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
} = process.env;

// Docs on the different redis options
// https://github.com/NodeRedis/node_redis#options-object-properties
const redisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  connect_timeout: 15000,
  enable_offline_queue: true,
  retry_unfulfilled_commands: true,
  retry_strategy: options => {
    // reconnect after
    return Math.max(options.attempt * 100, 3000);
  },
};

const configGooglePubsub = (): IGoogleOptions => {
  const checkHasConfigFile = fs.existsSync(path.join(__dirname, '..', '/google_cred.json'));

  if (!checkHasConfigFile) {
    throw new Error('Google credentials file not found!');
  }

  const serviceAccount = require('../google_cred.json');

  return {
    projectId: serviceAccount.project_id,
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
  };
};

const createBrokerInstance = (): GooglePubSub | Redis => {
  if (PUBSUB_TYPE === 'GOOGLE') {
    const googleOptions = configGooglePubsub();

    return new GooglePubSub(googleOptions);
  }

  return new Redis(redisOptions);
};

const broker = createBrokerInstance();

export const publish = (action: string, data: IPubsubData) => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV !== 'production') {
    return;
  }

  return broker.publish('widgetNotification', JSON.stringify({ action, data }));
};
