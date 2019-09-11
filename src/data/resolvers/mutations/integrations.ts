import * as validator from 'validator';

import {
  Brands,
  Conversations,
  Customers,
  Fields,
  Forms,
  FormSubmissions,
  IMessageDocument,
  Integrations,
  Messages,
} from '../../../db/models';

import { IBrowserInfo } from '../../../db/models/Customers';
import { sendMessage } from '../../../messageQueue';
import { IEmail, sendEmail } from '../utils/email';

interface ISubmission {
  _id: string;
  value: any;
  type?: string;
  validation?: string;
}

interface IError {
  fieldId: string;
  code: string;
  text: string;
}

export const validate = async (formId: string, submissions: ISubmission[]): Promise<IError[]> => {
  const fields = await Fields.find({ contentTypeId: formId });
  const errors = [];

  for (const field of fields) {
    // find submission object by _id
    const submission = submissions.find(sub => sub._id === field._id);

    if (!submission) {
      continue;
    }

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

      // phone
      if ((type === 'phone' || validation === 'phone') && !/^\d{8,}$/.test(value.replace(/[\s()+\-\.]|ext/gi, ''))) {
        errors.push({
          fieldId: field._id,
          code: 'invalidPhone',
          text: 'Invalid phone',
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

export const saveValues = async (args: {
  integrationId: string;
  submissions: ISubmission[];
  formId: string;
  browserInfo: IBrowserInfo;
}): Promise<IMessageDocument> => {
  const { integrationId, submissions, formId, browserInfo } = args;

  const form = await Forms.findOne({ _id: formId });

  if (!form) {
    return null;
  }

  const content = form.title;

  let email;
  let phone;
  let firstName = '';
  let lastName = '';

  submissions.forEach(submission => {
    if (submission.type === 'email') {
      email = submission.value;
    }

    if (submission.type === 'phone') {
      phone = submission.value;
    }

    if (submission.type === 'firstName') {
      firstName = submission.value;
    }

    if (submission.type === 'lastName') {
      lastName = submission.value;
    }
  });

  // get or create customer
  const customer = await Customers.getOrCreateCustomer({ email }, { integrationId, email, firstName, lastName, phone });

  await Customers.updateLocation(customer._id, browserInfo);

  // Inserting customer id into submitted customer ids
  const doc = {
    formId,
    customerId: customer._id,
    submittedAt: new Date(),
  };

  FormSubmissions.createFormSubmission(doc);

  // create conversation
  const conversation = await Conversations.createConversation({
    integrationId,
    customerId: customer._id,
    content,
  });

  // create message
  return Messages.createMessage({
    conversationId: conversation._id,
    customerId: customer._id,
    content,
    formWidgetData: submissions,
  });
};

export default {
  // Find integrationId by brandCode
  async formConnect(_root, args: { brandCode: string; formCode: string }) {
    const brand = await Brands.findOne({ code: args.brandCode });
    const form = await Forms.findOne({ code: args.formCode });

    if (!brand || !form) {
      throw new Error('Invalid configuration');
    }

    // find integration by brandId & formId
    const integ = await Integrations.findOne({
      brandId: brand._id,
      formId: form._id,
    });

    if (!integ) {
      throw new Error('Integration not found');
    }

    if (integ.leadData && integ.leadData.loadType === 'embedded') {
      await Forms.increaseViewCount(form._id);
    }

    // return integration details
    return {
      integration: integ,
      form,
    };
  },

  // create new conversation using form data
  async saveForm(
    _root,
    args: {
      integrationId: string;
      formId: string;
      submissions: ISubmission[];
      browserInfo: any;
    },
  ) {
    const { formId, submissions } = args;

    const errors = await validate(formId, submissions);

    if (errors.length > 0) {
      return { status: 'error', errors };
    }

    const message = await saveValues(args);

    if (!message) {
      return { status: 'error', errors: ['Invalid form'] };
    }

    // increasing form submitted count
    await Forms.increaseContactsGathered(formId);

    // notify main api
    sendMessage('callPublish', {
      trigger: 'conversationClientMessageInserted',
      payload: message,
    });

    sendMessage('callPublish', {
      trigger: 'conversationMessageInserted',
      payload: message,
    });

    return { status: 'ok', messageId: message._id };
  },

  // send email
  sendEmail(_root, args: IEmail) {
    sendEmail(args);
  },

  formIncreaseViewCount(_root, { formId }: { formId: string }) {
    return Forms.increaseViewCount(formId);
  },
};
