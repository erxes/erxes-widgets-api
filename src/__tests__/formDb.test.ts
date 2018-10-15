import { connect, disconnect } from "../db/connection";
import { customerFactory, formFactory } from "../db/factories";
import { Forms, IFormDocument } from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Form related tests
 */
describe("Forms", () => {
  let _form: IFormDocument;

  beforeEach(async () => {
    // Creating test form
    _form = await formFactory({});
  });

  afterEach(() => {
    // Clearing test forms
    return Forms.remove({});
  });

  test("Increase view count of form", async () => {
    let updatedForm = await Forms.increaseViewCount(_form._id);
    expect(updatedForm.viewCount).toBe(1);

    updatedForm = await Forms.increaseViewCount(_form._id);
    expect(updatedForm.viewCount).toBe(2);
  });

  test("Increase contacts gathered", async () => {
    let updatedForm = await Forms.increaseContactsGathered(_form._id);

    expect(updatedForm.contactsGathered).toBe(1);

    updatedForm = await Forms.increaseContactsGathered(_form._id);
    expect(updatedForm.contactsGathered).toBe(2);
  });

  test("update submitted customer ids", async () => {
    const customer = await customerFactory({});

    const updatedForm = await Forms.addSubmission(_form._id, customer._id);

    expect(updatedForm.submissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customerId: customer._id
        })
      ])
    );
  });
});
