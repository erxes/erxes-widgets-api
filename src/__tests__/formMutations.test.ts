import formMutations, {
  saveValues,
  validate
} from "../data/resolvers/mutations/form";
import { connect, disconnect } from "../db/connection";
import {
  brandFactory,
  formFactory,
  formFieldFactory,
  integrationFactory
} from "../db/factories";
import {
  Brands,
  Conversations,
  Customers,
  Fields,
  Forms,
  IFieldDocument,
  Integrations,
  Messages
} from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

describe("Form mutations", () => {
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

  describe("formConnect", () => {
    const brandCode = "brandCode";
    const formCode = "formCode";

    beforeEach(async () => {
      const brand = await brandFactory({ code: brandCode });
      const form = await formFactory({ code: formCode });

      await integrationFactory({ brandId: brand._id, formId: form._id });
    });

    test("connect", async () => {
      const res = await formMutations.formConnect({}, { brandCode, formCode });

      // must return integrationId and formId
      expect(res.integrationId).toBeDefined();
      expect(res.formId).toBeDefined();
    });
  });

  describe("validate", async () => {
    const formId = "DFDFDAFD";
    const contentTypeId = formId;

    test("validate", async () => {
      const requiredField = await formFieldFactory({
        contentTypeId,
        isRequired: true
      });

      const emailField = await formFieldFactory({
        contentTypeId,
        validation: "email"
      });
      const numberField = await formFieldFactory({
        contentTypeId,
        validation: "number"
      });
      const validNumberField = await formFieldFactory({
        contentTypeId,
        validation: "number"
      });
      const validDateField = await formFieldFactory({
        contentTypeId,
        validation: "date"
      });
      const dateField = await formFieldFactory({
        contentTypeId,
        validation: "date"
      });

      const submissions = [
        { _id: requiredField._id, value: null },
        { _id: emailField._id, value: "email", validation: "email" },
        { _id: numberField._id, value: "number", validation: "number" },
        { _id: validNumberField._id, value: 10, validation: "number" },
        { _id: dateField._id, value: "date", validation: "date" },
        { _id: validDateField._id, value: "2012-09-01", validation: "date" }
      ];

      // call function
      const errors = await validate(formId, submissions);

      // must be 4 error
      expect(errors.length).toEqual(4);

      const [requiredError, emailError, numberError, dateError] = errors;

      // required
      expect(requiredError.fieldId).toEqual(requiredField._id);
      expect(requiredError.code).toEqual("required");

      // email
      expect(emailError.fieldId).toEqual(emailField._id);
      expect(emailError.code).toEqual("invalidEmail");

      // number
      expect(numberError.fieldId).toEqual(numberField._id);
      expect(numberError.code).toEqual("invalidNumber");

      // date
      expect(dateError.fieldId).toEqual(dateField._id);
      expect(dateError.code).toEqual("invalidDate");
    });
  });

  describe("saveValues", () => {
    const integrationId = "DFDFDAFD";
    const formTitle = "Form";

    let formId: string;

    let emailField: IFieldDocument;
    let firstNameField: IFieldDocument;
    let lastNameField: IFieldDocument;
    let arbitraryField: IFieldDocument;

    beforeEach(async () => {
      formId = (await formFactory({ title: formTitle }))._id;

      const contentTypeId = formId;

      emailField = await formFieldFactory({
        contentTypeId,
        type: "emailFieldId"
      });
      firstNameField = await formFieldFactory({
        contentTypeId,
        type: "firstNameFieldId"
      });
      lastNameField = await formFieldFactory({
        contentTypeId,
        type: "lastNameFieldId"
      });
      arbitraryField = await formFieldFactory({ contentTypeId, type: "input" });
    });

    test("saveValues", async () => {
      const submissions = [
        { _id: arbitraryField._id, value: "Value", type: "input" },
        { _id: emailField._id, value: "email@gmail.com", type: "email" },
        { _id: firstNameField._id, value: "first name", type: "firstName" },
        { _id: lastNameField._id, value: "last name", type: "lastName" }
      ];

      const browserInfo = {
        remoteAddress: "127.0.0.1",
        url: "localhost",
        hostname: "localhost.com",
        language: "en",
        userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5)
          AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36`
      };

      // call function
      await saveValues({ integrationId, formId, submissions, browserInfo });

      // must create 1 conversation
      expect(await Conversations.find().count()).toBe(1);

      // must create 1 message
      expect(await Messages.find().count()).toBe(1);

      // check conversation fields
      const conversation = await Conversations.findOne({});

      if (!conversation) {
        throw new Error("conversation not found");
      }

      expect(conversation.content).toBe(formTitle);
      expect(conversation.integrationId).toBe(integrationId);
      expect(conversation.customerId).toEqual(expect.any(String));

      // check message fields
      const message = await Messages.findOne({});

      if (!message) {
        throw new Error("message not found");
      }

      expect(message.conversationId).not.toBe(null);
      expect(message.content).toBe(formTitle);
      expect(message.formWidgetData).toEqual(submissions);

      // must create 1 customer
      expect(await Customers.find().count()).toBe(1);

      // check customer fields
      const customer = await Customers.findOne({});

      if (!customer) {
        throw new Error("customer not found");
      }

      expect(customer.primaryEmail).toBe("email@gmail.com");
      expect(customer.emails).toContain("email@gmail.com");
      expect(customer.firstName).toBe("first name");
      expect(customer.lastName).toBe("last name");

      if (!customer.location) {
        throw new Error("location is null");
      }

      expect(customer.location.hostname).toBe(browserInfo.hostname);
      expect(customer.location.language).toBe(browserInfo.language);
      expect(customer.location.userAgent).toBe(browserInfo.userAgent);
    });
  });
});
