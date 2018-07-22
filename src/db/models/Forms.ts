import { Model, model } from 'mongoose';
import * as Random from 'meteor-random';
import { IFormDocument, FormSchema } from './definations/forms';

interface IFormModel extends Model<IFormDocument> {
  increaseViewCount(formId: string): Promise<string>
  increaseContactsGathered(formId: string): Promise<string>
  addSubmission(formId: string, customerId: string): Promise<string>
}

class Form {
  /**
   * Increase form view count
   * @param  {String} formId - id of a form to update
   * @return {Promise} Existing form object
   */
  static async increaseViewCount(formId) {
    const formObj = await Forms.findOne({ _id: formId });

    let viewCount = 0;

    if (formObj.viewCount) {
      viewCount = formObj.viewCount;
    }

    viewCount++;

    await Forms.update({ _id: formId }, { viewCount });

    return formId;
  }

  /**
   * Increase form submitted count
   * @param  {String} formId - id of a form to update
   * @return {Promise} Existing form object
   */
  static async increaseContactsGathered(formId) {
    const formObj = await Forms.findOne({ _id: formId });

    let contactsGathered = 0;

    if (formObj.contactsGathered) {
      contactsGathered = formObj.contactsGathered;
    }

    contactsGathered++;

    await Forms.update({ _id: formId }, { contactsGathered });

    return formId;
  }

  /**
   * Add customer to submitted customer ids
   * @param  {String} formId - id of a form to update
   * @param  {String} customerId - id of a customer who submitted
   * @return {Promise} Existing form object
   */
  static async addSubmission(formId, customerId) {
    const submittedAt = new Date();

    await Forms.update({ _id: formId }, { $push: { submissions: { customerId, submittedAt } } });

    return formId;
  }
}

FormSchema.loadClass(Form);

const Forms = model<IFormDocument, IFormModel>('forms', FormSchema);

export default Forms;
