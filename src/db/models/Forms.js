import mongoose from 'mongoose';
import Random from 'meteor-random';

// schema for form's callout component
const CalloutSchema = mongoose.Schema(
  {
    title: String,
    body: String,
    buttonText: String,
    featuredImage: String,
    skip: Boolean,
  },
  { _id: false },
);

const SubmissionSchema = mongoose.Schema(
  {
    customerId: String,
    submittedAt: Date,
  },
  { _id: false },
);

const FormSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: String,
  description: String,
  code: String,
  buttonText: String,
  themeColor: String,
  callout: CalloutSchema,
  viewCount: Number,
  contactsGathered: Number,
  submissions: [SubmissionSchema],
});

class Form {
  /**
   * Increase form view count
   * @param  {String} formId - id of a form to update
   * @return {Promise} Existing form object
   */
  static async increaseViewCount(formId) {
    const formObj = await this.findOne({ _id: formId });

    let viewCount = 0;

    if (formObj.viewCount) {
      viewCount = formObj.viewCount;
    }

    viewCount++;

    await this.update({ _id: formId }, { viewCount });

    return formId;
  }

  /**
   * Increase form submitted count
   * @param  {String} formId - id of a form to update
   * @return {Promise} Existing form object
   */
  static async increaseContactsGathered(formId) {
    const formObj = await this.findOne({ _id: formId });

    let contactsGathered = 0;

    if (formObj.contactsGathered) {
      contactsGathered = formObj.contactsGathered;
    }

    contactsGathered++;

    await this.update({ _id: formId }, { contactsGathered });

    return formId;
  }

  /**
   * Add customer to submitted customer ids
   * @param  {String} formId - id of a form to update
   * @param  {String} customerId - id of a customer who submitted
   * @return {Promise} Existing form object
   */
  static async updateSubmittedCustomer(formId, customerId) {
    const submittedAt = new Date();

    await this.update({ _id: formId }, { $push: { submissions: { customerId, submittedAt } } });

    return formId;
  }
}

FormSchema.loadClass(Form);

const Forms = mongoose.model('forms', FormSchema);

export default Forms;
