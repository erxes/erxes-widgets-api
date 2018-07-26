import * as validator from "validator";

import {
  Brands,
  Conversations,
  Customers,
  Fields,
  Forms,
  Integrations,
  Messages
} from "../../../db/models";

import { IBrowserInfo } from "../../../db/models/Customers";

import { mutateAppApi } from "../../../utils";
import { IEmail, sendEmail } from "../utils/email";

interface ISubmission {
  _id: string;
  value: any;
  type?: string;
  validation?: string;
}

export const validate = async (formId: string, submissions: ISubmission[]) => {
  const fields = await Fields.find({ contentTypeId: formId });
  const errors = [];

  for (const field of fields) {
    // find submission object by _id
    const submission = submissions.find(sub => sub._id === field._id);

    if (!submission) {
      continue;
    }

    const value = submission.value || "";

    const type = field.type;
    const validation = field.validation;

    // required
    if (field.isRequired && !value) {
      errors.push({
        fieldId: field._id,
        code: "required",
        text: "Required"
      });
    }

    if (value) {
      // email
      if (
        (type === "email" || validation === "email") &&
        !validator.isEmail(value)
      ) {
        errors.push({
          fieldId: field._id,
          code: "invalidEmail",
          text: "Invalid email"
        });
      }

      // number
      if (validation === "number" && !validator.isNumeric(value.toString())) {
        errors.push({
          fieldId: field._id,
          code: "invalidNumber",
          text: "Invalid number"
        });
      }

      // date
      if (validation === "date" && !validator.isISO8601(value)) {
        errors.push({
          fieldId: field._id,
          code: "invalidDate",
          text: "Invalid Date"
        });
      }
    }
  }

  return errors;
};

export const saveValues = async (args: {
  integrationId: string;
  submissions: ISubmission[];
  formId: string;
  browserInfo: IBrowserInfo;
}) => {
  const { integrationId, submissions, formId, browserInfo } = args;

  const form = await Forms.findOne({ _id: formId });

  if (!form) {
    return null;
  }

  const content = form.title;

  let email;
  let firstName = "";
  let lastName = "";

  submissions.forEach(submission => {
    if (submission.type === "email") {
      email = submission.value;
    }

    if (submission.type === "firstName") {
      firstName = submission.value;
    }

    if (submission.type === "lastName") {
      lastName = submission.value;
    }
  });

  // get or create customer
  const customer = await Customers.getOrCreateCustomer(
    { email },
    { integrationId, email, firstName, lastName }
  );

  await Customers.updateLocation(customer._id, browserInfo);

  // Inserting customer id into submitted customer ids
  Forms.addSubmission(formId, customer._id);

  // create conversation
  const conversation = await Conversations.createConversation({
    integrationId,
    customerId: customer._id,
    content
  });

  // create message
  return Messages.createMessage({
    conversationId: conversation._id,
    content,
    formWidgetData: submissions
  });
};

export default {
  // Find integrationId by brandCode
  async formConnect(root: any, args: { brandCode: string; formCode: string }) {
    const brand = await Brands.findOne({ code: args.brandCode });
    const form = await Forms.findOne({ code: args.formCode });

    if (!brand || !form) {
      throw new Error("Invalid configuration");
    }

    // find integration by brandId & formId
    const integ = await Integrations.findOne({
      brandId: brand._id,
      formId: form._id
    });

    if (!integ) {
      throw new Error("Integration not found");
    }

    if (integ.formData && integ.formData.loadType === "embedded") {
      await Forms.increaseViewCount(form._id);
    }

    // return integration details
    return {
      integrationId: integ._id,
      integrationName: integ.name,
      languageCode: integ.languageCode,
      formId: integ.formId,
      formData: {
        ...integ.formData,
        title: form.title,
        description: form.description,
        buttonText: form.buttonText,
        themeColor: form.themeColor,
        callout: form.callout
      }
    };
  },

  // create new conversation using form data
  async saveForm(
    root: any,
    args: {
      integrationId: string;
      formId: string;
      submissions: ISubmission[];
      browserInfo: any;
    }
  ) {
    const { formId, submissions, browserInfo } = args;

    const errors = await validate(formId, submissions);

    if (errors.length > 0) {
      return { status: "error", errors };
    }

    const message = await saveValues(args);

    if (!message) {
      return { status: "error", errors: ["Invalid form"] };
    }

    // increasing form submitted count
    await Forms.increaseContactsGathered(formId);

    // notify app api
    mutateAppApi(`
      mutation {
        conversationPublishClientMessage(_id: "${message._id}")
      }`);

    return { status: "ok", messageId: message._id };
  },

  // send email
  sendEmail(root: any, args: IEmail) {
    sendEmail(args);
  },

  formIncreaseViewCount(root: any, { formId }: { formId: string }) {
    return Forms.increaseViewCount(formId);
  }
};
