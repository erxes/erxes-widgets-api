import { Integrations, Conversations, Messages, Customers, Companies } from '../../../db/models';
import { createEngageVisitorMessages } from '../utils/engage';
import { mutateAppApi } from '../../../utils';

export default {
  /*
   * End conversation
   */
  async endConversation(root, { brandCode, data, browserInfo }, { remoteAddress }) {
    // find integration
    const integ = await Integrations.getIntegration(brandCode, 'messenger');

    // create customer
    const customer = await Customers.createMessengerCustomer(
      { integrationId: integ._id },
      data,
      remoteAddress,
      browserInfo,
    );

    return { customerId: customer._id };
  },

  /**
   * Create a new customer or update existing customer info
   * when connection established
   * @return {Promise}
   */

  async messengerConnect(root, args, { remoteAddress }) {
    const {
      brandCode,
      name,
      email,
      phone,
      isUser,
      companyData,
      data,
      browserInfo,
      cachedCustomerId,
    } = args;

    // find integration
    const integration = await Integrations.getIntegration(brandCode, 'messenger');

    if (!integration) {
      throw new Error('Integration not found');
    }

    let customer = await Customers.getCustomer({
      cachedCustomerId,
      integrationId: integration._id,
      email,
      phone,
    });

    // update customer
    if (customer) {
      // update messenger session data
      customer = await Customers.updateMessengerSession(customer._id);

      // update fields
      await Customers.updateMessengerCustomer(
        customer._id,
        { phone, isUser, name },
        data,
        remoteAddress,
        browserInfo,
      );

      // create new customer
    } else {
      customer = await Customers.createMessengerCustomer(
        {
          integrationId: integration._id,
          email,
          phone,
          isUser,
          name,
        },
        data,
        remoteAddress,
        browserInfo,
      );
    }

    // get or create company
    if (companyData) {
      const company = await Companies.getOrCreate(companyData);

      // add company to customer's companyIds list
      await Customers.addCompany(customer._id, company._id);
    }

    // try to create engage chat auto messages
    if (!isUser) {
      await createEngageVisitorMessages({
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
        conversationSubscribeMessageCreated(_id: "${msg._id}")
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
        conversationSubscribeChanged(_ids: ["${args.conversationId}"], type: "readState")
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
