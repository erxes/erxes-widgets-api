import validator from 'validator';
import {
  Customers,
  Integrations,
  Brands,
  Conversations,
  Messages,
  Forms,
  Fields,
} from '../../../db/models';
import { sendEmail } from '../utils/email';
import { mutateAppApi } from '../../../utils';

export const validate = async (formId, submissions) => {
  const fields = await Fields.find({ contentTypeId: formId });
  const errors = [];

  for (let field of fields) {
    // find submission object by _id
    const submission = submissions.find(sub => sub._id === field._id);
    const value = submission.value || '';
    const type = field.type;
    const validation = field.validation;

    // required
    if (field.isRequired && !value) {
      errors.push({
        fieldId: field._id,
        code: 'required',
        text: 'Required',
      });
    }

    if (value) {
      // email
      if ((type === 'email' || validation === 'email') && !validator.isEmail(value)) {
        errors.push({
          fieldId: field._id,
          code: 'invalidEmail',
          text: 'Invalid email',
        });
      }

      // number
      if (validation === 'number' && !validator.isNumeric(value.toString())) {
        errors.push({
          fieldId: field._id,
          code: 'invalidNumber',
          text: 'Invalid number',
        });
      }

      // date
      if (validation === 'date' && !validator.isISO8601(value)) {
        errors.push({
          fieldId: field._id,
          code: 'invalidDate',
          text: 'Invalid Date',
        });
      }
    }
  }

  return errors;
};

export const saveValues = async (args, browserInfo) => {
  const { integrationId, submissions, formId } = args;
  const form = await Forms.findOne({ _id: formId });
  const content = form.title;

  let email;
  let firstName = '';
  let lastName = '';

  submissions.forEach(submission => {
    if (submission.type === 'email') {
      email = submission.value;
    }

    if (submission.type === 'firstName') {
      firstName = submission.value;
    }

    if (submission.type === 'lastName') {
      lastName = submission.value;
    }
  });

  // get or create customer
  const customer = await Customers.getOrCreateCustomer({
    integrationId,
    email,
    firstName,
    lastName,
  });

  await Customers.updateLocation(customer._id, browserInfo);

  // Inserting customer id into submitted customer ids
  Forms.addSubmission(formId, customer._id);

  // create conversation
  const conversationId = await Conversations.createConversation({
    integrationId,
    customerId: customer._id,
    content,
  });

  // create message
  return Messages.createMessage({
    conversationId,
    content,
    formWidgetData: submissions,
  });
};

export default {
  // Find integrationId by brandCode
  async formConnect(root, args) {
    const brand = await Brands.findOne({ code: args.brandCode });
    const form = await Forms.findOne({ code: args.formCode });

    // find integration by brandId & formId
    const integ = await Integrations.findOne({
      brandId: brand._id,
      formId: form._id,
    });

    if (!integ) {
      throw new Error('Integration not found');
    }

    if (integ.formLoadType === 'embedded') {
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
        callout: form.callout,
      },
    };
  },

  // create new conversation using form data
  async saveForm(root, args) {
    const { formId, submissions, browserInfo } = args;

    const errors = await validate(formId, submissions);

    if (errors.length > 0) {
      return { status: 'error', errors };
    }

    const message = await saveValues(args, browserInfo);

    // increasing form submitted count
    await Forms.increaseContactsGathered(formId);

    // notify app api
    mutateAppApi(`
      mutation {
        conversationSubscribeMessageCreated(_id: "${message._id}")
      }`);

    return { status: 'ok', messageId: message._id };
  },

  // send email
  sendEmail(root, args) {
    sendEmail(args);
  },

  formIncreaseViewCount(root, { formId }) {
    return Forms.increaseViewCount(formId);
  },
};
