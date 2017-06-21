import { Conversations, Messages, Customers } from './connectors';
import { pubsub } from './subscription-manager';
import {
  getIntegration,
  getCustomer,
  getOrCreateConversation,
  createMessage,
  createCustomer,
  CONVERSATION_STATUSES,
} from './utils';

export default {
  simulateInsertMessage(root, args) {
    return Messages.findOne({ _id: args.messageId }).then(message => {
      pubsub.publish('newMessagesChannel', message);
      pubsub.publish('notification');
    });
  },

  /**
   * Create a new customer or update existing customer info
   * when connection established
   * @return {Promise}
   */
  messengerConnect(root, { brandCode, email, isUser, name }) {
    let integrationId;
    let uiOptions;
    let messengerData;

    // Email is required
    if (!email) {
      return Promise.reject('Email is required');
    }

    // find integration
    return (
      getIntegration(brandCode, 'messenger')
        // fetch integration and customer data
        .then(integration => {
          integrationId = integration._id;
          uiOptions = integration.uiOptions;
          messengerData = integration.messengerData;

          return getCustomer(integrationId, email);
        })
        // If it's existing user, update its information
        // if not create a new one
        .then(customer => {
          if (!customer) {
            return createCustomer({ integrationId, email, isUser, name });
          }

          // Updating session count
          // QUESTION: Is it working properly?
          const now = new Date();
          const idleLimit = 30 * 60 * 1000;
          const incrementBy = now - customer.messengerData.lastSeenAt > idleLimit ? 1 : 0;

          return Customers.findByIdAndUpdate(
            customer._id,
            {
              $set: {
                name,
                isUser,
                'messengerData.lastSeenAt': now,
                'messengerData.isActive': true,
              },
              $inc: {
                'messengerData.sessionCount': incrementBy,
              },
            },
            { new: true },
          );
        })
        // TODO: Returning the variables outside promise is not safe.
        // integrationId, uiOptions, messengerData
        .then(customer => ({
          integrationId,
          uiOptions,
          messengerData,
          customerId: customer._id,
        }))
        .catch(error => {
          console.log(error); // eslint-disable-line no-console
        })
    );
  },

  /**
   * Create a new message
   * @return {Promise}
   */
  insertMessage(root, { integrationId, customerId, conversationId, message, attachments }) {
    // get or create conversation
    return (
      getOrCreateConversation({ conversationId, integrationId, customerId, message })
        // create message
        .then(conversation =>
          createMessage({
            conversationId: conversation._id,
            customerId,
            content: message,
            attachments,
          }),
        )
        .then(msg => {
          Conversations.update(
            { _id: msg.conversationId },
            {
              $set: {
                // Reopen its conversation if it's closed
                status: CONVERSATION_STATUSES.OPEN,

                // Mark as unread
                readUserIds: [],
              },
            },
          );

          // publish changes
          pubsub.publish('newMessagesChannel', msg);
          pubsub.publish('notification');

          return msg;
        })
        .catch(error => {
          console.log(error); // eslint-disable-line no-console
        })
    );
  },

  /**
   * Mark given conversation's messages as read
   * @return {Promise}
   */
  readConversationMessages(root, args) {
    return (
      Messages.update(
        {
          conversationId: args.conversationId,
          userId: { $exists: true },
          isCustomerRead: { $exists: false },
        },
        { isCustomerRead: true },
        { multi: true },
      )
        // notify all notification subscribers that message's read
        // state changed
        .then(() => {
          pubsub.publish('notification');
        })
    );
  },
};
