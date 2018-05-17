import {
  Integrations,
  Brands,
  Conversations,
  Messages,
  Customers,
  Companies,
} from '../../../db/models';
import { createEngageVisitorMessages } from '../utils/engage';
import { mutateAppApi } from '../../../utils';

export default {
  /**
   * Create a new customer or update existing customer info
   * when connection established
   * @return {Promise}
   */
  async messengerConnect(root, args) {
    const { brandCode, email, phone, isUser, companyData, data, cachedCustomerId } = args;

    // find integration
    const integration = await Integrations.getIntegration(brandCode, 'messenger');

    if (!integration) {
      throw new Error('Integration not found');
    }

    let customer = await Customers.getCustomer({
      cachedCustomerId,
      email,
      phone,
    });

    if (customer) {
      // update fields
      await Customers.updateMessengerCustomer(customer._id, { phone, isUser }, data);

      // create new customer
    } else {
      customer = await Customers.createMessengerCustomer(
        {
          integrationId: integration._id,
          email,
          phone,
          isUser,
        },
        data,
      );
    }

    // get or create company
    if (companyData) {
      const company = await Companies.getOrCreate(companyData);

      // add company to customer's companyIds list
      await Customers.addCompany(customer._id, company._id);
    }

    return {
      integrationId: integration._id,
      uiOptions: integration.uiOptions,
      languageCode: integration.languageCode,
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

    // mark customer as active
    await Customers.markCustomerAsActive(conversation.customerId);

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
        isCustomerRead: { $ne: true },
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

  saveCustomerGetNotified(root, args) {
    return Customers.saveVisitorContactInfo(args);
  },

  /**
   * Update customer location field
   */
  async saveBrowserInfo(root, { customerId, browserInfo }) {
    // update location
    await Customers.updateLocation(customerId, browserInfo);

    // update messenger session data
    const customer = await Customers.updateMessengerSession({
      _id: customerId,
      url: browserInfo.url,
    });

    const integration = await Integrations.findOne({ _id: customer.integrationId });
    const brand = await Brands.findOne({ _id: integration.brandId });

    // try to create engage chat auto messages
    if (!customer.email) {
      return createEngageVisitorMessages({
        brand,
        integration,
        customer,
        browserInfo,
      });
    }

    return [];
  },
};
