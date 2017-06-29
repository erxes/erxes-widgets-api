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

export const validate = (formId, submissions) =>
  FormFields.find({ formId }).then(fields => {
    const errors = [];

    fields.forEach(field => {
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
    });

    return errors;
  });

export const getOrCreateCustomer = (integrationId, email, name) =>
  Customers.getCustomer(integrationId, email).then(customer => {
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
  });

export const saveValues = ({ integrationId, submissions, formId }) =>
  Forms.findOne({ _id: formId }).then(form => {
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
    return (
      getOrCreateCustomer(integrationId, email, `${lastName} ${firstName}`)
        // create conversation
        .then(customerId =>
          Conversations.createConversation({
            integrationId,
            customerId,
            content,
          }),
        )
        // create message
        .then(conversationId =>
          Messages.createMessage({
            conversationId,
            content,
            formWidgetData: submissions,
          }),
        )
        // catch exception
        .catch(error => {
          console.log(error); // eslint-disable-line no-console
        })
    );
  });

export default {
  // Find integrationId by brandCode
  formConnect(root, args) {
    let brandId;

    // find brand by code
    return (
      Brands.findOne({ code: args.brandCode })
        .then(brand => {
          brandId = brand._id;

          // find form by code
          return Forms.findOne({ code: args.formCode });
        })
        // find integration by brandId & formId
        .then(form =>
          Integrations.findOne({
            brandId,
            formId: form._id,
          }),
        )
        // return integration details
        .then(integ => ({
          integrationId: integ._id,
          integrationName: integ.name,
          formId: integ.formId,
          formData: integ.formData,
        }))
        // catch exception
        .catch(error => {
          console.log(error); // eslint-disable-line no-console
        })
    );
  },

  // create new conversation using form data
  saveForm(root, args) {
    const { formId, submissions } = args;

    return validate(formId, submissions).then(errors => {
      if (errors.length > 0) {
        return errors;
      }

      return saveValues(args).then(() => []);
    });
  },

  // send email
  sendEmail(root, args) {
    sendEmail(args);
  },
};
