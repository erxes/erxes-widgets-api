import validator from 'validator';
import {
  Customers,
  Integrations,
  Brands,
  Conversations,
  Messages,
  Forms,
  FormFields,
} from '../../../db/models';
import { sendEmail } from '../utils/email';
import { mutateAppApi } from '../utils/common';

export const validate = async (formId, submissions) => {
  const fields = await FormFields.find({ formId });
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

export const getOrCreateCustomer = async (integrationId, email, name) => {
  const customer = await Customers.getCustomer({ integrationId, email });

  if (!email) {
    return Promise.resolve(null);
  }

  // customer found
  if (customer) {
    return Promise.resolve(customer._id);
  }

  // create customer
  return Customers.createCustomer({ integrationId, email, name }).then(cus =>
    Promise.resolve(cus._id),
  );
};

export const saveValues = async ({ integrationId, submissions, formId }) => {
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
  const customerId = await getOrCreateCustomer(integrationId, email, `${lastName} ${firstName}`);

  // create conversation
  const conversationId = await Conversations.createConversation({
    integrationId,
    customerId,
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

    // return integration details
    return {
      integrationId: integ._id,
      integrationName: integ.name,
      formId: integ.formId,
      formData: integ.formData,
    };
  },

  // create new conversation using form data
  async saveForm(root, args) {
    const { formId, submissions } = args;

    const errors = await validate(formId, submissions);

    if (errors.length > 0) {
      return { status: 'error', errors };
    }

    const message = await saveValues(args);

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
};
