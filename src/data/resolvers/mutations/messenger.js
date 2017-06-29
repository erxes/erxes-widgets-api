import { Integrations, Conversations, Messages, Customers } from '../../../db/models';
import { pubsub } from '../../subscriptionManager';

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
      Integrations.getIntegration(brandCode, 'messenger')
        // fetch integration and customer data
        .then(integration => {
          integrationId = integration._id;
          uiOptions = integration.uiOptions;
          messengerData = integration.messengerData;

          return Customers.getCustomer(integrationId, email);
        })
        // If it's existing user, update its information
        // if not create a new one
        .then(customer => {
          if (!customer) {
            return Customers.createCustomer({ integrationId, email, isUser, name });
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
    let newMessage;
    return (
      Conversations.getOrCreateConversation({ conversationId, integrationId, customerId, message })
        // create message
        .then(conversation =>
          Messages.createMessage({
            conversationId: conversation._id,
            customerId,
            content: message,
            attachments,
          }),
        )
        .then(msg => {
          newMessage = msg;
          return Conversations.update(
            { _id: msg.conversationId },
            {
              $set: {
                // Reopen its conversation if it's closed
                status: Conversations.getConversationStatuses().OPEN,

                // Mark as unread
                readUserIds: [],
              },
            },
          );
        })
        .then(() => {
          // publish changes
          pubsub.publish('newMessagesChannel', newMessage);
          pubsub.publish('notification');

          return newMessage;
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
        .then(response => {
          pubsub.publish('notification');
          return response;
        })
    );
  },
};
