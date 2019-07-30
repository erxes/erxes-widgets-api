import { Brands, Companies, Conversations, Customers, Integrations, Messages } from '../../../db/models';

import { IBrowserInfo, IVisitorContactInfoParams } from '../../../db/models/Customers';
import { sendMessage } from '../../../messageQueue';
import { createEngageVisitorMessages } from '../utils/engage';
import { unreadMessagesQuery } from '../utils/messenger';

export default {
  /*
   * Create a new customer or update existing customer info
   * when connection established
   */
  async messengerConnect(
    _root,
    args: {
      brandCode: string;
      email?: string;
      phone?: string;
      isUser?: boolean;
      companyData?: any;
      data?: any;
      cachedCustomerId?: string;
      deviceToken?: string;
    },
  ) {
    const { brandCode, email, phone, isUser, companyData, data, cachedCustomerId, deviceToken } = args;

    const customData = data;

    // find brand
    const brand = await Brands.findOne({ code: brandCode });

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
      // update prev customer
      customer = await Customers.updateMessengerCustomer({
        _id: customer._id,
        doc: {
          email,
          phone,
          isUser,
          deviceToken,
        },
        customData,
      });

      // create new customer
    } else {
      customer = await Customers.createMessengerCustomer(
        {
          integrationId: integration._id,
          email,
          phone,
          isUser,
          deviceToken,
        },
        customData,
      );
    }

    // get or create company
    if (companyData) {
      const company = await Companies.getOrCreate(companyData);

      // add company to customer's companyIds list
      await Customers.addCompany(customer._id, company._id);
    }

    const messengerData = await Integrations.getMessengerData(integration);

    return {
      integrationId: integration._id,
      uiOptions: integration.uiOptions,
      languageCode: integration.languageCode,
      messengerData,
      customerId: customer._id,
      brand,
    };
  },

  /*
   * Create a new message
   */
  async insertMessage(
    _root,
    args: {
      integrationId: string;
      customerId: string;
      conversationId?: string;
      message: string;
      attachments?: any[];
    },
  ) {
    const { integrationId, customerId, conversationId, message, attachments } = args;

    // get or create conversation
    const conversation = await Conversations.getOrCreateConversation({
      conversationId,
      integrationId,
      customerId,
      content: message,
    });

    // create message
    const msg = await Messages.createMessage({
      conversationId: conversation._id,
      customerId,
      content: message,
      attachments,
    });

    await Conversations.updateOne(
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

    // notify main api
    sendMessage('callPublish', {
      trigger: 'conversationClientMessageInserted',
      payload: msg,
    });

    sendMessage('callPublish', {
      trigger: 'conversationMessageInserted',
      payload: msg,
    });

    sendMessage('callPublish', {
      trigger: 'conversationClientTypingStatusChanged',
      payload: {
        conversationId,
        text: '',
      },
    });

    return msg;
  },

  /*
   * Mark given conversation's messages as read
   */
  async readConversationMessages(_root, args: { conversationId: string }) {
    const response = await Messages.updateMany(
      {
        conversationId: args.conversationId,
        userId: { $exists: true },
        isCustomerRead: { $ne: true },
      },
      { isCustomerRead: true },
      { multi: true },
    );

    return response;
  },

  saveCustomerGetNotified(_root, args: IVisitorContactInfoParams) {
    return Customers.saveVisitorContactInfo(args);
  },

  /*
   * Update customer location field
   */
  async saveBrowserInfo(_root, { customerId, browserInfo }: { customerId: string; browserInfo: IBrowserInfo }) {
    // update location
    await Customers.updateLocation(customerId, browserInfo);

    // update messenger session data
    const customer = await Customers.updateMessengerSession(customerId, browserInfo.url || '');

    // Preventing from displaying non messenger integrations like form's messages
    // as last unread message
    const integration = await Integrations.findOne({
      _id: customer.integrationId,
      kind: 'messenger',
    });

    if (!integration) {
      return null;
    }

    const brand = await Brands.findOne({ _id: integration.brandId });

    if (!brand) {
      return null;
    }

    // try to create engage chat auto messages
    if (!customer.primaryEmail) {
      await createEngageVisitorMessages({
        brand,
        integration,
        customer,
        browserInfo,
      });
    }

    // find conversations
    const convs = await Conversations.find({
      integrationId: integration._id,
      customerId: customer._id,
    });

    return Messages.findOne(unreadMessagesQuery(convs));
  },

  sendTypingInfo(_root, args: { conversationId: string; text?: string }) {
    sendMessage('callPublish', {
      trigger: 'conversationClientTypingStatusChanged',
      payload: args,
    });

    return 'ok';
  },
};
