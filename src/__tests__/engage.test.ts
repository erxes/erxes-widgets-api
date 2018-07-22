import {
  replaceKeys,
  createOrUpdateConversationAndMessages,
  createEngageVisitorMessages,
} from '../data/resolvers/utils/engage';

import {
  integrationFactory,
  messageFactory,
  customerFactory,
  brandFactory,
  userFactory,
} from '../db/factories';

import { connect, disconnect } from '../db/connection';

import {
  Conversations,
  Messages,
  Integrations,
  Customers,
  Brands,
  EngageMessages,
} from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('replace keys', () => {
  test('must replace customer, user placeholders', () => {
    const response = replaceKeys({
      content: 'hi {{ customer.name }} - {{ user.fullName }}',
      customer: { name: 'name' },
      user: { fullName: 'fullName' },
    });

    expect(response).toBe('hi name - fullName');
  });
});

describe('createConversation', () => {
  let _customer;
  let _integration;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory();
    _integration = await integrationFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.remove({});
    await Integrations.remove({});
    await Conversations.remove({});
    await Messages.remove({});
  });

  test('createOrUpdateConversationAndMessages', async () => {
    const user = {
      _id: 'DFFDFDFD',
      fullName: 'Full name',
    };

    const kwargs = {
      customer: _customer,
      integration: _integration,
      user,
      engageData: {
        content: 'hi {{ customer.name }} {{ user.fullName }}',
        messageId: '_id',
      },
    };

    // create ==========================
    const message = await createOrUpdateConversationAndMessages(kwargs);
    const conversation = await Conversations.findOne({ _id: message.conversationId });

    expect(await Conversations.find().count()).toBe(1);
    expect(await Messages.find().count()).toBe(1);

    // check message fields
    expect(message._id).toBeDefined();
    expect(message.content).toBe(`hi ${_customer.name} Full name`);
    expect(message.userId).toBe(user._id);
    expect(message.customerId).toBe(_customer._id);

    // check conversation fields
    expect(conversation._id).toBeDefined();
    expect(conversation.content).toBe(`hi ${_customer.name} Full name`);
    expect(conversation.integrationId).toBe(_integration._id);

    // second time ==========================
    // must not create new conversation & messages update
    await Messages.update({ conversationId: conversation._id }, { $set: { isCustomerRead: true } });

    let response = await createOrUpdateConversationAndMessages(kwargs);

    expect(response).toBe(null);

    expect(await Conversations.find().count()).toBe(1);
    expect(await Messages.find().count()).toBe(1);

    const updatedMessage = await Messages.findOne({
      conversationId: conversation._id,
    });

    expect(updatedMessage.isCustomerRead).toBe(false);

    // do not mark as unread for conversations that
    // have more than one messages =====================
    await Messages.update({ conversationId: conversation._id }, { $set: { isCustomerRead: true } });

    await messageFactory({
      conversationId: conversation._id,
      isCustomerRead: true,
    });

    response = await createOrUpdateConversationAndMessages(kwargs);

    expect(response).toBe(null);

    expect(await Conversations.find().count()).toBe(1);
    expect(await Messages.find().count()).toBe(2);

    const [message1, message2] = await Messages.find({
      conversationId: conversation._id,
    });

    expect(message1.isCustomerRead).toBe(true);
    expect(message2.isCustomerRead).toBe(true);
  });
});

describe('createEngageVisitorMessages', () => {
  let _user;
  let _brand;
  let _customer;
  let _integration;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory({
      urlVisits: { '/page': 11 },
    });

    _brand = await brandFactory({});
    _integration = await integrationFactory({ brandId: _brand._id });
    _user = await userFactory({});

    const message = new EngageMessages({
      title: 'Visitor',
      fromUserId: _user._id,
      kind: 'visitorAuto',
      method: 'messenger',
      isLive: true,
      messenger: {
        brandId: _brand._id,
        rules: [
          {
            kind: 'currentPageUrl',
            condition: 'is',
            value: '/page',
          },
          {
            kind: 'numberOfVisits',
            condition: 'greaterThan',
            value: 10,
          },
        ],
        content: 'hi {{ customer.name }}',
      },
    });

    return message.save();
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.remove({});
    await Integrations.remove({});
    await Conversations.remove({});
    await Messages.remove({});
    await Brands.remove({});
  });

  test('must create conversation & message object', async () => {
    // previous unread conversation messages created by engage
    await messageFactory({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: {
        messageId: '_id2',
      },
    });

    await messageFactory({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: {
        messageId: '_id2',
      },
    });

    // main call
    await createEngageVisitorMessages({
      brand: _brand,
      customer: _customer,
      integration: _integration,
      browserInfo: {
        url: '/page',
      },
    });

    const conversation = await Conversations.findOne({});
    const content = `hi ${_customer.name}`;

    expect(conversation._id).toBeDefined();
    expect(conversation.content).toBe(content);
    expect(conversation.customerId).toBe(_customer._id);
    expect(conversation.integrationId).toBe(_integration._id);

    const message = await Messages.findOne({
      conversationId: conversation._id,
    });

    expect(message._id).toBeDefined();
    expect(message.content).toBe(content);

    // count of unread conversation messages created by engage must be zero
    const convEngageMessages = await Messages.find({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: { $exists: true },
    });

    expect(convEngageMessages.length).toBe(0);
  });
});
