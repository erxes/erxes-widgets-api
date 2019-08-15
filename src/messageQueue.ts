import * as amqplib from 'amqplib';
import { debugBase } from './debuggers';

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let connection;
let channel;

const initBroker = async () => {
  try {
    connection = await amqplib.connect(RABBITMQ_HOST);
    channel = await connection.createChannel();
  } catch (e) {
    debugBase(e.message);
  }
};

export const sendMessage = async (action: string, data) => {
  if (NODE_ENV === 'test') {
    return;
  }

  try {
    await channel.assertQueue('widgetNotification');
    await channel.sendToQueue('widgetNotification', Buffer.from(JSON.stringify({ action, data })));
  } catch (e) {
    debugBase(e.message);
  }
};

initBroker();
