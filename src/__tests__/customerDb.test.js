/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import Random from 'meteor-random';
import { connect, disconnect } from '../db/connection';
import { customerFactory } from '../db/factories';
import { Customers } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

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

  test('createMessengerCustomer() must return a new customer', async () => {
    const now = new Date();

    const first_name = 'test first name';
    const last_name = 'test last name';
    const bio = 'test BIO 1231321312';

    const customData = {
      first_name,
      last_name,
      bio,
      created_at: '1321313',
    };

    const customer = await Customers.createMessengerCustomer(
      {
        integrationId: _customer.integrationId,
        email: _customer.email,
        isUser: _customer.isUser,
        name: _customer.name,
      },
      customData,
      {},
    );

    expect(customer).toBeDefined();
    expect(customer.email).toBe(_customer.email);
    expect(customer.isUser).toBe(_customer.isUser);
    expect(customer.name).toBe(_customer.name);
    expect(customer.messengerData.lastSeenAt).toBeDefined();
    expect(customer.messengerData.isActive).toBe(true);
    expect(customer.messengerData.sessionCount).toBe(1);
    expect(customer.createdAt >= now).toBe(true);

    expect(customer.firstName).toBe(first_name);
    expect(customer.lastName).toBe(last_name);
    expect(customer.description).toBe(bio);
    expect(customer.messengerData.customData.first_name).toBeUndefined();
    expect(customer.messengerData.customData.last_name).toBeUndefined();
    expect(customer.messengerData.customData.bio).toBeUndefined();
    expect(customer.messengerData.customData.created_at).toBe(customData.created_at);
  });

  test('getCustomer() must return an existing customer', async () => {
    const customer = await Customers.getCustomer({
      email: _customer.emails[0],
    });

    expect(customer).toBeDefined();
    expect(_customer.emails).toContain(customer.email);
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
    expect(customer.emails).toContain(_customer.email);
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
    expect(customer.createdAt).toBeDefined();
  });

  test('active state', async () => {
    // inactive
    const now = new Date();
    let customer = await Customers.markCustomerAsNotActive(_customer._id);

    expect(customer).toBeDefined();
    expect(customer.messengerData.isActive).toBeFalsy();
    expect(customer.messengerData.lastSeenAt >= now).toBeTruthy();

    // active
    customer = await Customers.markCustomerAsActive(_customer._id);
    expect(customer.messengerData.isActive).toBeTruthy();
  });

  test('updateMessengerSession()', async () => {
    const now = new Date();

    const customer = await Customers.updateMessengerSession({
      _id: _customer._id,
      url: '/career/open',
    });

    expect(customer.messengerData.isActive).toBeTruthy();
    expect(customer.messengerData.lastSeenAt >= now).toBeTruthy();
    expect(customer.urlVisits['/career/open']).toBe(1);
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

  test('saveVisitorContactInfo()', async () => {
    // email ==========
    let customer = await Customers.saveVisitorContactInfo({
      customerId: _customer._id,
      type: 'email',
      value: 'test@gmail.com',
    });

    expect(customer.visitorContactInfo.email).toBe('test@gmail.com');

    // phone ===============
    customer = await Customers.saveVisitorContactInfo({
      customerId: _customer._id,
      type: 'phone',
      value: '985435353',
    });

    // check company in companyIds
    expect(customer.visitorContactInfo.phone).toBe('985435353');
  });
});
