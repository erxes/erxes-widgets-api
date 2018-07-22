import { connect, disconnect } from '../db/connection';
import { formFactory, customerFactory } from '../db/factories';
import { Forms } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Form related tests
 */
describe('Forms', () => {
  let _form;

  beforeEach(async () => {
    // Creating test form
    _form = await formFactory({});
  });

  afterEach(() => {
    // Clearing test forms
    return Forms.remove({});
  });

  test('Increase view count of form', async () => {
    await Forms.increaseViewCount(_form._id);
    _form = await Forms.findOne({ _id: _form._id });

    expect(_form.viewCount).toBe(1);

    await Forms.increaseViewCount(_form._id);
    _form = await Forms.findOne({ _id: _form._id });

    expect(_form.viewCount).toBe(2);

    let formObj = await formFactory({});
    await Forms.increaseViewCount(formObj._id);

    formObj = await Forms.findOne({ _id: formObj._id });
    expect(formObj.viewCount).toBe(1);
  });

  test('Increase contacts gathered', async () => {
    await Forms.increaseContactsGathered(_form._id);
    _form = await Forms.findOne({ _id: _form._id });

    expect(_form.contactsGathered).toBe(1);

    await Forms.increaseContactsGathered(_form._id);
    _form = await Forms.findOne({ _id: _form._id });

    expect(_form.contactsGathered).toBe(2);

    let formObj = await formFactory({});
    await Forms.increaseContactsGathered(formObj._id);

    formObj = await Forms.findOne({ _id: formObj._id });
    expect(formObj.contactsGathered).toBe(1);
  });

  test('update submitted customer ids', async () => {
    const customer = await customerFactory({});

    await Forms.addSubmission(_form._id, customer._id);

    const formObj = await Forms.findOne({ _id: _form._id });

    expect(formObj.submissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customerId: customer._id,
        }),
      ]),
    );
  });
});
