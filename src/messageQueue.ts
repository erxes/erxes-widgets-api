import * as amqplib from 'amqplib';
import { debugBase } from './debuggers';

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

export const sendMessage = async (action: string, data) => {
  if (NODE_ENV === 'test') {
    return;
  }

  try {
    const conn = await amqplib.connect(RABBITMQ_HOST);
    const channel = await conn.createChannel();

    await channel.assertQueue('widgetNotification');
    await channel.sendToQueue('widgetNotification', Buffer.from(JSON.stringify({ action, data })));
  } catch (e) {
    debugBase(e.message);
  }
};
