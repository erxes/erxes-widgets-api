/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import Random from 'meteor-random';
import { connect, disconnect } from '../db/connection';
import {
  brandFactory,
  integrationFactory,
  customerFactory,
  conversationFactory,
} from '../db/factories';
import { Integrations, Customers, Conversations, Messages } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Integrations', () => {
  let _brand;
  let _integration;

  beforeEach(async () => {
    // Creating test brand and integration
    _brand = await brandFactory();
    _integration = await integrationFactory({ brandId: _brand._id, kind: 'messenger' });
  });

  afterEach(() => {
    // Clearing test data
    return Customers.remove({});
  });

  test('getIntegration() must return an integration', async () => {
    const integration = await Integrations.getIntegration(_brand.code, _integration.kind);
    expect(integration).toBeDefined();
    expect(integration.kind).toBe(_integration.kind);
  });
});

/**
 * Customer related tests
 */
describe('Customers', () => {
  let _customer;

  beforeEach(async () => {
    // Creating test customer
    _customer = await customerFactory();
  });

  afterEach(() => {
    // Clearing test customers
    return Customers.remove({});
  });

  test('createCustomer() must return a new customer', async () => {
    const now = new Date();

    const customer = await Customers.createCustomer({
      integrationId: _customer.integrationId,
      email: _customer.email,
      isUser: _customer.isUser,
      name: _customer.name,
    });

    expect(customer).toBeDefined();
    expect(customer.email).toBe(_customer.email);
    expect(customer.isUser).toBe(_customer.isUser);
    expect(customer.name).toBe(_customer.name);
    expect(customer.messengerData.lastSeenAt).toBe(customer.createdAt);
    expect(customer.messengerData.isActive).toBe(true);
    expect(customer.messengerData.sessionCount).toBe(1);
    expect(customer.createdAt >= now).toBe(true);
  });

  test('getCustomer() must return an existing customer', async () => {
    const customer = await Customers.getCustomer({
      integrationId: _customer.integrationId,
      email: _customer.email,
    });

    expect(customer).toBeDefined();
    expect(customer.email).toBe(_customer.email);
    expect(customer.isUser).toBe(_customer.isUser);
    expect(customer.name).toBe(_customer.name);
    expect(customer._id).toBe(_customer._id);
    expect(customer.integrationId).toBe(_customer.integrationId);
    expect(customer.createdAt).toEqual(_customer.createdAt);
    expect(customer.messengerData).toEqual(_customer.messengerData);
  });

  test('getOrCreateCustomer() must return an existing customer', async () => {
    const now = new Date();

    const customer = await Customers.getOrCreateCustomer(_customer);

    expect(customer).toBeDefined();
    expect(customer.email).toBe(_customer.email);
    expect(customer.isUser).toBe(_customer.isUser);
    expect(customer.name).toBe(_customer.name);
    expect(customer._id).toBe(_customer._id);
    expect(customer.integrationId).toBe(_customer.integrationId);
    expect(customer.createdAt).toEqual(_customer.createdAt);
    expect(customer.messengerData).toEqual(_customer.messengerData);
    expect(customer.createdAt < now).toBe(true);
  });

  test('getOrCreateCustomer() must return a new customer', async () => {
    const unexistingCustomer = {
      integrationId: Random.id(),
      email: faker.internet.email(),
    };

    const now = new Date();

    const customer = await Customers.getOrCreateCustomer(unexistingCustomer);

    expect(customer).toBeDefined();
    expect(customer.email).toBe(unexistingCustomer.email);
    expect(customer.integrationId).toBe(unexistingCustomer.integrationId);
    expect(customer.createdAt >= now).toBe(true);
    expect(customer.createdAt).toEqual(customer.messengerData.lastSeenAt);
    expect(customer.messengerData.sessionCount).toBe(1);
  });

  test('markCustomerAsNotActive() must return true', async () => {
    const now = new Date();
    const customer = await Customers.markCustomerAsNotActive(_customer._id);

    expect(customer).toBeDefined();
    expect(customer.messengerData.isActive).toBeFalsy();
    expect(customer.messengerData.lastSeenAt >= now).toBeTruthy();
  });

  test('updateMessengerData()', async () => {
    const now = new Date();
    const customer = await Customers.updateMessengerData(_customer._id);

    expect(customer.messengerData.isActive).toBeTruthy();
    expect(customer.messengerData.lastSeenAt >= now).toBeTruthy();
  });

  test('addCompany()', async () => {
    const company1Id = 'DFDAFDFFDSF';
    const company2Id = 'DFFDSFDSFJK';

    let customer = await Customers.addCompany(_customer._id, company1Id);

    // check company in companyIds
    expect(customer.companyIds.length).toBe(1);

    customer = await Customers.addCompany(_customer._id, company1Id);
    customer = await Customers.addCompany(_customer._id, company2Id);

    // check company in companyIds
    expect(customer.companyIds.length).toBe(2);
  });
});

/**
 * Conversations related tests
 */
describe('Conversations', () => {
  let _conversation;

  beforeEach(async () => {
    // Creating test conversation
    _conversation = await conversationFactory();
  });

  afterEach(() => {
    // Clearing test data
    return Conversations.remove({}).then(() => Messages.remove({}));
  });

  test('createConversation() must return a new conversation', async () => {
    const now = new Date();

    const conversation = await Conversations.createConversation({
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      content: _conversation.content,
    });

    expect(conversation).toBeDefined();
    expect(conversation.integrationId).toBe(_conversation.integrationId);
    expect(conversation.customerId).toBe(_conversation.customerId);
    expect(conversation.content).toBe(_conversation.content);
    expect(conversation.createdAt >= now).toBe(true);
    expect(conversation.messageCount).toBe(0);
    expect(conversation.status).toBe(Conversations.getConversationStatuses().NEW);
    expect(conversation.number).toBe(2);
  });

  test('getOrCreateConversation() must return an existing conversation', async () => {
    const now = new Date();

    const conversation = await Conversations.getOrCreateConversation({
      conversationId: _conversation._id,
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      message: _conversation.content,
    });

    expect(conversation).toBeDefined();
    expect(conversation._id).toBe(_conversation._id);
    expect(conversation.createdAt < now).toBe(true);
    expect(conversation.status).toBe(Conversations.getConversationStatuses().OPEN);
    expect(conversation.readUserIds.length).toBe(0);
  });

  test('getOrCreateConversation() must return a new conversation', async () => {
    const now = new Date();

    const conversation = await Conversations.getOrCreateConversation({
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      message: _conversation.content,
    });

    expect(conversation).toBeDefined();
    expect(conversation._id).not.toBe(_conversation._id);
    expect(conversation.createdAt >= now).toBe(true);
    expect(conversation.status).toBe(Conversations.getConversationStatuses().NEW);
    expect(conversation.messageCount).toBe(0);
    expect(conversation.content).toBe(_conversation.content);
    expect(conversation.readUserIds.length).toBe(0);
    expect(conversation.number).toBe(2);
  });

  test('createMessage() must return a new message', async () => {
    const now = new Date();

    const _message = {
      conversationId: _conversation._id,
      customerId: Random.id(),
      content: faker.lorem.sentence(),
    };

    const message = await Messages.createMessage(_message);

    expect(message).toBeDefined();
    expect(message._id).toBeDefined();
    expect(message.createdAt >= now).toBeTruthy();
    expect(message.userId).toBeUndefined();
    expect(message.isCustomerRead).toBeUndefined();
    expect(message.internal).toBeFalsy();
  });
});
