import { customerFactory, formFactory } from '../db/factories';
import { Forms, FormSubmissions } from '../db/models';
import { IFormDocument } from '../db/models/definitions/forms';

/**
 * Form related tests
 */
describe('Forms', () => {
  let _form: IFormDocument;

  beforeEach(async () => {
    // Creating test form
    _form = await formFactory({});
  });

  afterEach(async () => {
    // Clearing test forms
    await Forms.deleteMany({});
    await FormSubmissions.deleteMany({});
  });

  test('form submission', async () => {
    const customer = await customerFactory({});

    const doc = {
      formId: _form._id,
      customerId: customer._id,
    };

    const updated = await FormSubmissions.createFormSubmission(doc);

    expect(updated.formId).toBe(_form._id);
    expect(updated.customerId).toBe(customer._id);
  });
});
