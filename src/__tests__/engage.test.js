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

  beforeEach(() => {
    // Creating test data
    return customerFactory()
      .then(customer => {
        _customer = customer;
        return integrationFactory({});
      })
      .then(integration => {
        _integration = integration;
      });
  });

  afterEach(() => {
    // Clearing test data
    return Promise.all([
      Customers.remove({}),
      Integrations.remove({}),
      Conversations.remove({}),
      Messages.remove({}),
    ]);
  });

  test('must create conversation & message object', () => {
    const user = {
      _id: 'DFFDFDFD',
      fullName: 'Full name',
    };

    return createConversation({
      customer: _customer,
      integration: _integration,
      user,
      messenger: {
        content: 'hi {{ customer.name }} {{ user.fullName }}',
      },
    }).then(({ message, conversation }) => {
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
});

describe('createEngageVisitorMessages', () => {
  let _user;
  let _brand;
  let _customer;
  let _integration;

  beforeEach(() => {
    // Creating test data
    return customerFactory()
      .then(customer => {
        _customer = customer;
        return integrationFactory({});
      })
      .then(integration => {
        _integration = integration;

        return brandFactory({});
      })
      .then(brand => {
        _brand = brand;

        return userFactory({});
      })
      .then(user => {
        _user = user;

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
  });

  afterEach(() => {
    // Clearing test data
    return Promise.all([
      Customers.remove({}),
      Integrations.remove({}),
      Conversations.remove({}),
      Messages.remove({}),
      Brands.remove({}),
    ]);
  });

  test('must create conversation & message object', () => {
    return createEngageVisitorMessages({
      brandCode: _brand.code,
      customer: _customer,
      integration: _integration,
      browserInfo: {
        url: '/page',
      },
    }).then(() => {
      return Conversations.findOne({}).then(conversation => {
        const content = `hi ${_customer.name}`;

        expect(conversation._id).toBeDefined();
        expect(conversation.content).toBe(content);
        expect(conversation.customerId).toBe(_customer._id);
        expect(conversation.integrationId).toBe(_integration._id);

        return Messages.findOne({}).then(message => {
          expect(message._id).toBeDefined();
          expect(message.content).toBe(content);
        });
      });
    });
  });
});
