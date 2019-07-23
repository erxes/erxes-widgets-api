import * as cote from 'cote';
import * as dotenv from 'dotenv';

// load environment variables
dotenv.config();

interface IPubsubData {
  type?: string;
  trigger?: string;
  payload: any;
}

const publisher = new cote.Publisher(
  { name: 'erxes-widgets-api' },
  {
    log: false,
    statusLogsEnabled: false,
  },
);

export const publish = (action: string, data: IPubsubData) => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'test') {
    return;
  }

  return publisher.publish('widgetNotification', JSON.stringify({ action, data }));
};
