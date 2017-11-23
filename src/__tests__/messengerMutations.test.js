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

    const { customerId } = await messengerMutations.messengerConnect(
      {},
      { brandCode: _brand.code, email, companyData: { name: 'company' } },
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
  });

  test('updates existing customer', async () => {
    const now = new Date();

    const { customerId } = await messengerMutations.messengerConnect(
      {},
      { brandCode: _brand.code, email: _customer.email, name: 'name', isUser: true },
      {},
    );

    expect(customerId).toBeDefined();

    const customer = await Customers.findById(customerId);

    expect(customer).toBeDefined();
    expect(customer.email).toBe(_customer.email);
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.createdAt < now).toBeTruthy();
    expect(customer.messengerData.sessionCount).toBe(_customer.messengerData.sessionCount + 1);

    // name, isUser must be update
    expect(customer.name).toBe('name');
    expect(customer.isUser).toBeTruthy();
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
