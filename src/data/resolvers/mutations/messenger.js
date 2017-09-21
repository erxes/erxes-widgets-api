import { Integrations, Conversations, Messages, Customers } from '../../../db/models';
import { createEngageVisitorMessages } from '../utils/engage';
import { mutateAppApi } from '../utils/common';

export default {
  /*
   * End conversation
   */

  async endConversation(root, { brandCode, data }) {
    // find integration
    const integ = await Integrations.getIntegration(brandCode, 'messenger');

    // create customer
    const customer = await Customers.createCustomer({ integrationId: integ._id }, data);

    return { customerId: customer._id };
  },

  /**
   * Create a new customer or update existing customer info
   * when connection established
   * @return {Promise}
   */

  async messengerConnect(root, args, context) {
    const { remoteAddress } = context || {};
    const { brandCode, email, phone, isUser, name, data, browserInfo, cachedCustomerId } = args;

    // find integration
    const integration = await Integrations.getIntegration(brandCode, 'messenger');

    if (!integration) {
      return {};
    }

    let customer = await Customers.getCustomer({
      cachedCustomerId,
      integrationId: integration._id,
      email,
      phone,
    });

    const now = new Date();

    // update customer
    if (customer) {
      // update messengerData
      await Customers.update(
        { _id: customer._id },
        {
          $set: {
            'messengerData.lastSeenAt': now,
            'messengerData.isActive': true,
            name,
            isUser,
          },
        },
        () => {},
      );

      if (now - customer.messengerData.lastSeenAt > 30 * 60 * 1000) {
        // update session count
        await Customers.update(
          { _id: customer._id },
          { $inc: { 'messengerData.sessionCount': 1 } },
          () => {},
        );
      }

      customer = await Customers.findOne({ _id: customer._id });

      // create new customer
    } else {
      customer = await Customers.createCustomer(
        { integrationId: integration._id, email, phone, isUser, name },
        data,
      );
    }

    // try to create engage chat auto messages
    if (!customer.email) {
      createEngageVisitorMessages({
        brandCode,
        customer,
        integration,
        remoteAddress,
        browserInfo,
      });
    }

    return {
      integrationId: integration._id,
      uiOptions: integration.uiOptions,
      messengerData: integration.messengerData,
      customerId: customer._id,
    };
  },

  /**
   * Create a new message
   * @return {Promise}
   */
  async insertMessage(root, { integrationId, customerId, conversationId, message, attachments }) {
    // get or create conversation
    const conversation = await Conversations.getOrCreateConversation({
      conversationId,
      integrationId,
      customerId,
      message,
    });

    // create message
    const msg = await Messages.createMessage({
      conversationId: conversation._id,
      customerId,
      content: message,
      attachments,
    });

    await Conversations.update(
      { _id: msg.conversationId },
      {
        $set: {
          // Reopen its conversation if it's closed
          status: Conversations.getConversationStatuses().OPEN,

          // setting conversation's content to last message
          content: message,

          // Mark as unread
          readUserIds: [],
        },
      },
    );

    // notify app api
    mutateAppApi(`
      mutation {
        conversationMessageInserted(_id: "${msg._id}")
      }`);

    return msg;
  },

  /**
   * Mark given conversation's messages as read
   * @return {Promise}
   */
  async readConversationMessages(root, args) {
    const response = await Messages.update(
      {
        conversationId: args.conversationId,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      },
      { isCustomerRead: true },
      { multi: true },
    );

    // notify app api
    mutateAppApi(`
      mutation {
        conversationsChanged(_ids: ["${args.conversationId}"], type: "readState")
      }`);

    return response;
  },

  saveCustomerGetNotified(root, { customerId, type, value }) {
    if (type === 'email') {
      return Customers.update({ _id: customerId }, { email: value });
    }

    if (type === 'phone') {
      return Customers.update({ _id: customerId }, { phone: value });
    }
  },
};
