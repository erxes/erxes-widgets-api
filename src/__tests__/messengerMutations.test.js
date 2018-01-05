/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import Random from 'meteor-random';
import { connect, disconnect } from '../db/connection';
import { Customers, Integrations, Brands, Conversations, Messages } from '../db/models';
import {
  brandFactory,
  integrationFactory,
  customerFactory,
  conversationFactory,
  messageFactory,
} from '../db/factories';
import messengerMutations from '../data/resolvers/mutations/messenger';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('messenger connect', () => {
  let _brand;
  let _integration;
  let _customer;

  beforeEach(async () => {
    // Creating test data
    _brand = await brandFactory();
    _integration = await integrationFactory({ brandId: _brand._id, kind: 'messenger' });
    _customer = await customerFactory({ integrationId: _integration._id });
  });

  afterEach(async () => {
    // Clearing test data
    await Brands.remove({});
    await Integrations.remove({});
    await Customers.remove({});
  });

  test('returns proper integrationId', async () => {
    const { integrationId } = await messengerMutations.messengerConnect(
      {},
      { brandCode: _brand.code, email: faker.internet.email() },
      {},
    );

    expect(integrationId).toBe(_integration._id);
  });

  test('creates new customer', async () => {
    const email = faker.internet.email();
    const now = new Date();

    const browserInfo = {
      url: 'localhost',
      hostname: 'localhost.com',
      language: 'en',
      userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5)
        AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36`,
    };

    const { customerId } = await messengerMutations.messengerConnect(
      {},
      { brandCode: _brand.code, email, companyData: { name: 'company' }, browserInfo },
      {},
    );

    expect(customerId).toBeDefined();

    const customer = await Customers.findById(customerId);

    expect(customer).toBeDefined();
    expect(customer.email).toBe(email);
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.createdAt >= now).toBeTruthy();
    expect(customer.companyIds.length).toBe(1);
    expect(customer.messengerData.sessionCount).toBe(1);
    expect(customer.location.hostname).toBe(browserInfo.hostname);
    expect(customer.location.language).toBe(browserInfo.language);
    expect(customer.location.userAgent).toBe(browserInfo.userAgent);
  });

  test('updates existing customer', async () => {
    const now = new Date();

    const { customerId } = await messengerMutations.messengerConnect(
      {},
      {
        brandCode: _brand.code,
        email: _customer.email,
        name: 'name',
        phone: '96221050',
        isUser: true,
        // customData
        data: {
          plan: 1,
        },
      },
      {},
    );

    expect(customerId).toBeDefined();

    const customer = await Customers.findById(customerId);

    expect(customer).toBeDefined();
    expect(customer.email).toBe(_customer.email);
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.createdAt < now).toBeTruthy();
    expect(customer.messengerData.sessionCount).toBe(_customer.messengerData.sessionCount + 1);

    // must be updated
    expect(customer.name).toBe('name');
    expect(customer.phone).toBe('96221050');
    expect(customer.isUser).toBeTruthy();
    expect(customer.messengerData.customData.plan).toBe(1);
  });
});

describe('insertMessage()', () => {
  let _integration;
  let _customer;

  beforeEach(async () => {
    // Creating test data
    _integration = await integrationFactory({ brandId: Random.id(), kind: 'messenger' });
    _customer = customerFactory({ integrationId: _integration._id });
  });

  afterEach(async () => {
    // Clearing test data
    await Integrations.remove({});
    await Customers.remove({});
  });

  test('returns a new message', async () => {
    const now = new Date();

    const message = await messengerMutations.insertMessage(
      {},
      {
        integrationId: _integration._id,
        customerId: _customer._id,
        message: faker.lorem.sentence(),
      },
      {},
    );

    expect(message).toBeDefined();
    expect(message.createdAt >= now).toBeTruthy();
  });

  test('updates conversation', async () => {
    const message = await messengerMutations.insertMessage(
      {},
      {
        integrationId: _integration._id,
        customerId: _customer._id,
        message: faker.lorem.sentence(),
      },
      {},
    );

    const conversation = await Conversations.findById(message.conversationId);

    expect(conversation.status).toBe(Conversations.getConversationStatuses().OPEN);
    expect(conversation.readUserIds.length).toBe(0);
  });
});

describe('readConversationMessages()', async () => {
  let _conversation;

  beforeEach(async () => {
    // Creating test data
    _conversation = await conversationFactory();

    await messageFactory({ conversationId: _conversation._id });
    await messageFactory({ conversationId: _conversation._id });
  });

  afterEach(async () => {
    // Clearing test data
    await Conversations.remove({});
    await Messages.remove({});
  });

  test("updates messages' isCustomerRead state", async () => {
    const response = await messengerMutations.readConversationMessages(
      {},
      { conversationId: _conversation._id },
      {},
    );

    expect(response.nModified).toBe(2);
  });
});
