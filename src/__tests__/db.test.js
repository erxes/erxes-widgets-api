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

  beforeEach(() => {
    // Creating test brand and integration
    return brandFactory()
      .then(brand => {
        _brand = brand;
        return integrationFactory({ brandId: brand._id, kind: 'messenger' });
      })
      .then(integration => {
        _integration = integration;
      });
  });

  afterEach(() => {
    // Clearing test data
    return Customers.remove({});
  });

  test('getIntegration() must return an integration', () => {
    return Integrations.getIntegration(_brand.code, _integration.kind).then(integration => {
      expect(integration).toBeDefined();
      expect(integration.kind).toBe(_integration.kind);
    });
  });
});

/**
 * Customer related tests
 */
describe('Customers', () => {
  let _customer;

  beforeEach(() => {
    // Creating test customer
    return customerFactory().then(customer => {
      _customer = customer;
    });
  });

  afterEach(() => {
    // Clearing test customers
    return Customers.remove({});
  });

  test('createCustomer() must return a new customer', () => {
    const now = new Date();
    return Customers.createCustomer({
      integrationId: _customer.integrationId,
      email: _customer.email,
      isUser: _customer.isUser,
      name: _customer.name,
    }).then(customer => {
      expect(customer).toBeDefined();
      expect(customer.email).toBe(_customer.email);
      expect(customer.isUser).toBe(_customer.isUser);
      expect(customer.name).toBe(_customer.name);
      expect(customer.messengerData.lastSeenAt).toBe(customer.createdAt);
      expect(customer.messengerData.isActive).toBe(true);
      expect(customer.messengerData.sessionCount).toBe(1);
      expect(customer.createdAt >= now).toBe(true);
    });
  });

  test('getCustomer() must return an existing customer', () => {
    return Customers.getCustomer({
      integrationId: _customer.integrationId,
      email: _customer.email,
    }).then(customer => {
      expect(customer).toBeDefined();
      expect(customer.email).toBe(_customer.email);
      expect(customer.isUser).toBe(_customer.isUser);
      expect(customer.name).toBe(_customer.name);
      expect(customer._id).toBe(_customer._id);
      expect(customer.integrationId).toBe(_customer.integrationId);
      expect(customer.createdAt).toEqual(_customer.createdAt);
      expect(customer.messengerData).toEqual(_customer.messengerData);
    });
  });

  test('getOrCreateCustomer() must return an existing customer', () => {
    const now = new Date();
    return Customers.getOrCreateCustomer(_customer).then(customer => {
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
  });

  test('getOrCreateCustomer() must return a new customer', () => {
    const unexistingCustomer = {
      integrationId: Random.id(),
      email: faker.internet.email(),
    };
    const now = new Date();
    return Customers.getOrCreateCustomer(unexistingCustomer).then(customer => {
      expect(customer).toBeDefined();
      expect(customer.email).toBe(unexistingCustomer.email);
      expect(customer.integrationId).toBe(unexistingCustomer.integrationId);
      expect(customer.createdAt >= now).toBe(true);
      expect(customer.createdAt).toEqual(customer.messengerData.lastSeenAt);
      expect(customer.messengerData.sessionCount).toBe(1);
    });
  });

  test('markCustomerAsNotActive() must return true', () => {
    const now = new Date();
    return Customers.markCustomerAsNotActive(_customer._id).then(customer => {
      expect(customer).toBeDefined();
      expect(customer.messengerData.isActive).toBeFalsy();
      expect(customer.messengerData.lastSeenAt >= now).toBeTruthy();
    });
  });
});

/**
 * Conversations related tests
 */
describe('Conversations', () => {
  let _conversation;

  beforeEach(() => {
    // Creating test conversation
    return conversationFactory().then(conversation => {
      _conversation = conversation;
    });
  });

  afterEach(() => {
    // Clearing test data
    return Conversations.remove({}).then(() => Messages.remove({}));
  });

  test('createConversation() must return a new conversation', () => {
    const now = new Date();
    return Conversations.createConversation({
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      content: _conversation.content,
    }).then(conversation => {
      expect(conversation).toBeDefined();
      expect(conversation.integrationId).toBe(_conversation.integrationId);
      expect(conversation.customerId).toBe(_conversation.customerId);
      expect(conversation.content).toBe(_conversation.content);
      expect(conversation.createdAt >= now).toBe(true);
      expect(conversation.messageCount).toBe(0);
      expect(conversation.status).toBe(Conversations.getConversationStatuses().NEW);
      expect(conversation.number).toBe(2);
    });
  });

  test('getOrCreateConversation() must return an existing conversation', () => {
    const now = new Date();
    return Conversations.getOrCreateConversation({
      conversationId: _conversation._id,
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      message: _conversation.content,
    }).then(conversation => {
      expect(conversation).toBeDefined();
      expect(conversation._id).toBe(_conversation._id);
      expect(conversation.createdAt < now).toBe(true);
      expect(conversation.status).toBe(Conversations.getConversationStatuses().OPEN);
      expect(conversation.readUserIds.length).toBe(0);
    });
  });

  test('getOrCreateConversation() must return a new conversation', () => {
    const now = new Date();
    return Conversations.getOrCreateConversation({
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      message: _conversation.content,
    }).then(conversation => {
      expect(conversation).toBeDefined();
      expect(conversation._id).not.toBe(_conversation._id);
      expect(conversation.createdAt >= now).toBe(true);
      expect(conversation.status).toBe(Conversations.getConversationStatuses().NEW);
      expect(conversation.messageCount).toBe(0);
      expect(conversation.content).toBe(_conversation.content);
      expect(conversation.readUserIds.length).toBe(0);
      expect(conversation.number).toBe(2);
    });
  });

  test('createMessage() must return a new message', () => {
    const now = new Date();
    const _message = {
      conversationId: Random.id(),
      customerId: Random.id(),
      content: faker.lorem.sentence(),
    };
    return Messages.createMessage(_message).then(message => {
      expect(message).toBeDefined();
      expect(message._id).toBeDefined();
      expect(message.createdAt >= now).toBeTruthy();
      expect(message.userId).toBeUndefined();
      expect(message.isCustomerRead).toBeUndefined();
      expect(message.internal).toBeFalsy();
    });
  });
});
