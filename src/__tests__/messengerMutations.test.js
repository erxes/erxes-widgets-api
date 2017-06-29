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

describe('messengerConnect()', () => {
  let _brand;
  let _integration;
  let _customer;

  beforeEach(() => {
    // Creating test data
    return brandFactory()
      .then(brand => {
        _brand = brand;
        return integrationFactory({ brandId: brand._id, kind: 'messenger' });
      })
      .then(integration => {
        _integration = integration;
        return customerFactory({ integrationId: integration._id });
      })
      .then(customer => {
        _customer = customer;
      });
  });

  afterEach(() => {
    // Clearing test data
    return Promise.all([Brands.remove({}), Integrations.remove({}), Customers.remove({})]);
  });

  test('rejects to be error if email is not provided', () => {
    const connectPromise = messengerMutations.messengerConnect({}, { brandCode: _brand.code });
    return expect(connectPromise).rejects.toBeDefined();
  });

  test('returns proper integrationId', () => {
    return messengerMutations
      .messengerConnect({}, { brandCode: _brand.code, email: faker.internet.email() })
      .then(({ integrationId }) => {
        expect(integrationId).toBe(_integration._id);
      });
  });

  test('creates new customer', () => {
    const email = faker.internet.email();
    const now = new Date();
    return messengerMutations
      .messengerConnect({}, { brandCode: _brand.code, email })
      .then(({ customerId }) => {
        expect(customerId).toBeDefined();
        return Customers.findById(customerId);
      })
      .then(customer => {
        expect(customer).toBeDefined();
        expect(customer.email).toBe(email);
        expect(customer.integrationId).toBe(_integration._id);
        expect(customer.createdAt >= now).toBeTruthy();
        expect(customer.messengerData.sessionCount).toBe(1);
      });
  });

  test('updates existing customer', () => {
    const now = new Date();
    return messengerMutations
      .messengerConnect({}, { brandCode: _brand.code, email: _customer.email })
      .then(({ customerId }) => {
        expect(customerId).toBeDefined();
        return Customers.findById(customerId);
      })
      .then(customer => {
        expect(customer).toBeDefined();
        expect(customer.email).toBe(_customer.email);
        expect(customer.integrationId).toBe(_integration._id);
        expect(customer.createdAt < now).toBeTruthy();
        expect(customer.messengerData.sessionCount).toBe(_customer.messengerData.sessionCount + 1);
      });
  });
});

describe('insertMessage()', () => {
  let _integration;
  let _customer;

  beforeEach(() => {
    // Creating test data
    return integrationFactory({ brandId: Random.id(), kind: 'messenger' })
      .then(integration => {
        _integration = integration;
        return customerFactory({ integrationId: integration._id });
      })
      .then(customer => {
        _customer = customer;
      });
  });

  afterEach(() => {
    // Clearing test data
    return Promise.all([Integrations.remove({}), Customers.remove({})]);
  });

  test('returns a new message', () => {
    const now = new Date();
    return messengerMutations
      .insertMessage(
        {},
        {
          integrationId: _integration._id,
          customerId: _customer._id,
          message: faker.lorem.sentence(),
        },
      )
      .then(message => {
        expect(message).toBeDefined();
        expect(message.createdAt >= now).toBeTruthy();
      });
  });

  test('updates conversation', () => {
    return messengerMutations
      .insertMessage(
        {},
        {
          integrationId: _integration._id,
          customerId: _customer._id,
          message: faker.lorem.sentence(),
        },
      )
      .then(message => Conversations.findById(message.conversationId))
      .then(conversation => {
        expect(conversation.status).toBe(Conversations.getConversationStatuses().OPEN);
        expect(conversation.readUserIds.length).toBe(0);
      });
  });
});

describe('readConversationMessages()', () => {
  let _conversation;

  beforeEach(() => {
    // Creating test data
    return conversationFactory().then(conversation => {
      _conversation = conversation;
      return Promise.all([
        messageFactory({ conversationId: conversation._id }),
        messageFactory({ conversationId: conversation._id }),
      ]);
    });
  });

  afterEach(() => {
    // Clearing test data
    return Promise.all([Conversations.remove({}), Messages.remove({})]);
  });

  test("updates messages' isCustomerRead state", () => {
    return messengerMutations
      .readConversationMessages({}, { conversationId: _conversation._id })
      .then(response => {
        expect(response.nModified).toBe(2);
      });
  });
});
