/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import {
  replaceKeys,
  createConversation,
  createEngageVisitorMessages,
} from '../data/resolvers/utils/engage';
import { integrationFactory, customerFactory, brandFactory, userFactory } from '../db/factories';
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

  test('must create conversation & message object', async () => {
    const user = {
      _id: 'DFFDFDFD',
      fullName: 'Full name',
    };

    const { message, conversation } = await createConversation({
      customer: _customer,
      integration: _integration,
      user,
      engageData: {
        content: 'hi {{ customer.name }} {{ user.fullName }}',
      },
    });

    // check message fields
    expect(message._id).toBeDefined();
    expect(message.content).toBe(`hi ${_customer.name} Full name`);
    expect(message.userId).toBe(user._id);
    expect(message.customerId).toBe(_customer._id);

    // check conversation fields
    expect(conversation._id).toBeDefined();
    expect(conversation.content).toBe(`hi ${_customer.name} Full name`);
    expect(conversation.integrationId).toBe(_integration._id);
  });
});

describe('createEngageVisitorMessages', () => {
  let _user;
  let _brand;
  let _customer;
  let _integration;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory();
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
    await createEngageVisitorMessages({
      brandCode: _brand.code,
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

    const message = await Messages.findOne({});

    expect(message._id).toBeDefined();
    expect(message.content).toBe(content);
  });
});
