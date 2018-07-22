import * as faker from 'faker';
import * as Random from 'meteor-random';
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
    _customer = await customerFactory({
      primaryEmail: 'email@gmail.com',
      emails: ['email@gmail.com', 'anotheremail@gmail.com'],
    });
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
    const email = 'email@gmail.com';
    const phone = '422999';

    const customData = {
      first_name,
      last_name,
      bio,
      created_at: '1321313',
    };

    const customer = await Customers.createMessengerCustomer(
      {
        integrationId: _customer.integrationId,
        email,
        phone,
        isUser: _customer.isUser,
      },
      customData,
    );

    expect(customer).toBeDefined();

    expect(customer.primaryEmail).toBe(email);
    expect(customer.emails).toContain(email);

    expect(customer.primaryPhone).toBe(phone);
    expect(customer.phones).toContain(phone);

    expect(customer.isUser).toBe(_customer.isUser);
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

  test('getCustomer(): emails, primaryEmail', async () => {
    let customer = await Customers.getCustomer({
      email: 'anotheremail@gmail.com',
    });

    expect(customer._id).toBeDefined();

    // check primaryEmail
    customer = await customerFactory({
      primaryEmail: 'customer@gmail.com',
      emails: ['main@gmail.com'],
    });

    customer = await Customers.getCustomer({
      email: 'customer@gmail.com',
    });

    expect(customer._id).toBeDefined();
  });

  test('getCustomer(): phones, primaryPhone', async () => {
    // check phones
    let customer = await customerFactory({
      phones: ['911111'],
    });

    customer = await Customers.getCustomer({
      phone: '911111',
    });

    expect(customer._id).toBeDefined();

    // check primaryPhone
    customer = await customerFactory({
      primaryPhone: '24244242',
    });

    customer = await Customers.getCustomer({
      phone: '24244242',
    });

    expect(customer._id).toBeDefined();
  });

  test('getOrCreateCustomer() must return an existing customer', async () => {
    const now = new Date();

    const doc = {
      ..._customer,
      email: 'email@gmail.com',
    };

    const customer = await Customers.getOrCreateCustomer(doc);

    expect(customer).toBeDefined();
    expect(customer.emails).toContain('email@gmail.com');
    expect(customer.isUser).toBe(_customer.isUser);
    expect(customer._id).toBe(_customer._id);
    expect(customer.integrationId).toBe(_customer.integrationId);
    expect(customer.createdAt).toEqual(_customer.createdAt);
    expect(customer.messengerData.toString()).toEqual(_customer.messengerData.toString());
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
    expect(customer.primaryEmail).toBe(unexistingCustomer.email);
    expect(customer.emails).toContain(unexistingCustomer.email);
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
    expect(customer.messengerData.lastSeenAt >= now.getTime()).toBeTruthy();

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
    expect(customer.messengerData.lastSeenAt >= now.getTime()).toBeTruthy();
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
