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
    _customer = await customerFactory({
      integrationId: _integration._id,
      primaryEmail: 'test@gmail.com',
      emails: ['test@gmail.com'],
      primaryPhone: '96221050',
      phone: ['96221050'],
    });
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
    const email = 'newCustomer@gmail.com';
    const now = new Date();

    const { customerId } = await messengerMutations.messengerConnect(
      {},
      { brandCode: _brand.code, email, companyData: { name: 'company' } },
      {},
    );

    expect(customerId).toBeDefined();

    const customer = await Customers.findById(customerId);

    expect(customer._id).toBeDefined();
    expect(customer.primaryEmail).toBe(email);
    expect(customer.emails).toContain(email);
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.createdAt >= now).toBeTruthy();
    expect(customer.companyIds.length).toBe(1);
    expect(customer.messengerData.sessionCount).toBe(1);
  });

  test('updates existing customer', async () => {
    const now = new Date();

    const { customerId } = await messengerMutations.messengerConnect(
      {},
      {
        brandCode: _brand.code,
        email: _customer.primaryEmail,
        isUser: true,
        // customData
        data: {
          plan: 1,
          first_name: 'name',
        },
      },
      {},
    );

    expect(customerId).toBeDefined();

    const customer = await Customers.findById(customerId);

    expect(customer).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.createdAt < now).toBeTruthy();

    // must be updated
    expect(customer.firstName).toBe('name');
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
    _customer = await customerFactory({ integrationId: _integration._id });
  });

  afterEach(async () => {
    // Clearing test data
    await Integrations.remove({});
    await Customers.remove({});
  });

  test('successfull', async () => {
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

    // check message ==========
    expect(message).toBeDefined();
    expect(message.createdAt >= now).toBeTruthy();

    // check conversation =========
    const conversation = await Conversations.findById(message.conversationId);

    expect(conversation.status).toBe(Conversations.getConversationStatuses().OPEN);
    expect(conversation.readUserIds.length).toBe(0);

    // check customer =========
    const customer = await Customers.findOne({ _id: _customer._id });
    expect(customer.messengerData.isActive).toBeTruthy();
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

describe('common', async () => {
  let _customer;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.remove({});
  });

  test('saveCustomerGetNotified', async () => {
    const response = await messengerMutations.saveCustomerGetNotified(
      {},
      {
        customerId: _customer._id,
        type: 'email',
        value: 'test@gmail.com',
      },
      {},
    );

    expect(response.visitorContactInfo.email).toBe('test@gmail.com');
  });

  test('Save browser info', async () => {
    const integration = await integrationFactory({
      brandId: Random.id(),
      kind: 'messenger',
    });

    const customer = await customerFactory({
      integrationId: integration._id,
      urlVisits: { '/career/open': 5 },
    });

    const browserInfo = {
      hostname: 'localhost.com',
      language: 'en',
      userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5)
        AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36`,
      url: '/career/open',
    };

    await messengerMutations.saveBrowserInfo({}, { customerId: customer._id, browserInfo });

    const updatedCustomer = await Customers.findOne({ _id: customer._id });

    expect(updatedCustomer.location.hostname).toBe(browserInfo.hostname);
    expect(updatedCustomer.location.language).toBe(browserInfo.language);
    expect(updatedCustomer.location.userAgent).toBe(browserInfo.userAgent);
    expect(updatedCustomer.messengerData.sessionCount).toBe(
      customer.messengerData.sessionCount + 1,
    );
    expect(updatedCustomer.urlVisits['/career/open']).toBe(6);
  });
});
