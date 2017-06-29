import { PubSub, SubscriptionManager } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export function getSubscriptionManager(schema) {
  return new SubscriptionManager({
    schema,
    pubsub,
    setupFunctions: {
      messageInserted: (options, args) => ({
        newMessagesChannel: {
          filter: message => message.conversationId === args.conversationId,
        },
      }),
    },
  });
}
