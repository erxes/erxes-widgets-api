/* eslint-env jest */

import formMutations, { validate, saveValues } from '../data/resolvers/mutations/form';
import {
  Brands,
  Integrations,
  Forms,
  Fields,
  Conversations,
  Messages,
  Customers,
} from '../db/models';
import { connect, disconnect } from '../db/connection';
import { brandFactory, integrationFactory, formFieldFactory, formFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Form mutations', () => {
  // remove previous datas
  afterEach(async () => {
    await Integrations.remove({});
    await Brands.remove({});
    await Fields.remove({});
    await Conversations.remove({});
    await Messages.remove({});
    await Forms.remove({});
    await Customers.remove({});
  });

  describe('formConnect', () => {
    const brandCode = 'brandCode';
    const formCode = 'formCode';

    beforeEach(async () => {
      const brand = await brandFactory({ code: brandCode });
      const form = await formFactory({ code: formCode });

      await integrationFactory({ brandId: brand._id, formId: form._id });
    });

    test('connect', async () => {
      const res = await formMutations.formConnect({}, { brandCode, formCode });

      // must return integrationId and formId
      expect(res.integrationId).toBeDefined();
      expect(res.formId).toBeDefined();
    });
  });

  test('validate', async () => {
    const formId = 'DFDFDAFD';
    const contentTypeId = formId;

    const requiredFieldId = await formFieldFactory({ contentTypeId, isRequired: true })._id;
    const emailFieldId = await formFieldFactory({ contentTypeId, validation: 'email' })._id;
    const numberFieldId = await formFieldFactory({ contentTypeId, validation: 'number' })._id;
    const validNumberFieldId = await formFieldFactory({ contentTypeId, validation: 'number' })._id;
    const validDateFieldId = await formFieldFactory({ contentTypeId, validation: 'date' })._id;
    const dateFieldId = await formFieldFactory({ contentTypeId, validation: 'date' })._id;

    it('validate', async () => {
      const submissions = [
        { _id: requiredFieldId, value: null },
        { _id: emailFieldId, value: 'email', validation: 'email' },
        { _id: numberFieldId, value: 'number', validation: 'number' },
        { _id: validNumberFieldId, value: 10, validation: 'number' },
        { _id: dateFieldId, value: 'date', validation: 'date' },
        { _id: validDateFieldId, value: '2012-09-01', validation: 'date' },
      ];

      // call function
      const errors = await validate(formId, submissions);

      // must be 4 error
      expect(errors.length).equal(4);

      const [requiredError, emailError, numberError, dateError] = errors;

      // required
      expect(requiredError.fieldId).equal(requiredFieldId);
      expect(requiredError.code).equal('required');

      // email
      expect(emailError.fieldId).equal(emailFieldId);
      expect(emailError.code).equal('invalidEmail');

      // number
      expect(numberError.fieldId).equal(numberFieldId);
      expect(numberError.code).equal('invalidNumber');

      // date
      expect(dateError.fieldId).equal(dateFieldId);
      expect(dateError.code).equal('invalidDate');
    });
  });

  describe('saveValues', () => {
    const integrationId = 'DFDFDAFD';
    const formTitle = 'Form';

    let formId;
    let emailFieldId;
    let firstNameFieldId;
    let lastNameFieldId;
    let arbitraryFieldId;

    beforeEach(async () => {
      formId = (await formFactory({ title: formTitle }))._id;

      const contentTypeId = formId;

      emailFieldId = (await formFieldFactory({ contentTypeId, type: 'emailFieldId' }))._id;
      firstNameFieldId = (await formFieldFactory({ contentTypeId, type: 'firstNameFieldId' }))._id;
      lastNameFieldId = (await formFieldFactory({ contentTypeId, type: 'lastNameFieldId' }))._id;
      arbitraryFieldId = (await formFieldFactory({ contentTypeId, type: 'input' }))._id;
    });

    test('saveValues', async () => {
      const submissions = [
        { _id: arbitraryFieldId, value: 'Value', type: 'input' },
        { _id: emailFieldId, value: 'email@gmail.com', type: 'email' },
        { _id: firstNameFieldId, value: 'first name', type: 'firstName' },
        { _id: lastNameFieldId, value: 'last name', type: 'lastName' },
      ];

      const browserInfo = {
        remoteAddress: '127.0.0.1',
        url: 'localhost',
        hostname: 'localhost.com',
        language: 'en',
        userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5)
          AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36`,
      };

      // call function
      await saveValues({ integrationId, formId, submissions }, browserInfo);

      // must create 1 conversation
      expect(await Conversations.find().count()).toBe(1);

      // must create 1 message
      expect(await Messages.find().count()).toBe(1);

      // check conversation fields
      const conversation = await Conversations.findOne({});
      expect(conversation.content).toBe(formTitle);
      expect(conversation.integrationId).toBe(integrationId);
      expect(conversation.customerId).toEqual(expect.any(String));

      // check message fields
      const message = await Messages.findOne({});
      expect(message.conversationId).not.toBe(null);
      expect(message.content).toBe(formTitle);
      expect(message.formWidgetData).toEqual(submissions);

      // must create 1 customer
      expect(await Customers.find().count()).toBe(1);

      // check customer fields
      const customer = await Customers.findOne({});

      expect(customer.email).toBe('email@gmail.com');
      expect(customer.firstName).toBe('first name');
      expect(customer.lastName).toBe('last name');
      expect(customer.location.hostname).toBe(browserInfo.hostname);
      expect(customer.location.language).toBe(browserInfo.language);
      expect(customer.location.userAgent).toBe(browserInfo.userAgent);
    });
  });
});
