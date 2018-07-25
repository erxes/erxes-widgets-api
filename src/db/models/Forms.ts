import { Model, model } from 'mongoose';
import { IFormDocument, FormSchema } from './definations/forms';

interface IFormModel extends Model<IFormDocument> {
  increaseViewCount(formId: string): Promise<IFormDocument>
  increaseContactsGathered(formId: string): Promise<IFormDocument>
  addSubmission(formId: string, customerId: string): Promise<IFormDocument>
}

class Form {
  /*
   * Increase form view count
   */
  static async increaseViewCount(formId: string) {
    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      throw new Error('Form not found');
    }

    let viewCount = 0;

    if (form.viewCount) {
      viewCount = form.viewCount;
    }

    viewCount++;

    await Forms.update({ _id: formId }, { viewCount });

    return Forms.findOne({ _id: formId });
  }

  /*
   * Increase form submitted count
   */
  static async increaseContactsGathered(formId: string) {
    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      throw new Error('Form not found');
    }

    let contactsGathered = 0;

    if (form.contactsGathered) {
      contactsGathered = form.contactsGathered;
    }

    contactsGathered++;

    await Forms.update({ _id: formId }, { contactsGathered });

    return Forms.findOne({ _id: formId });
  }

  /*
   * Add customer to submitted customer ids
   */
  static async addSubmission(formId: string, customerId: string) {
    const submittedAt = new Date();

    await Forms.update({ _id: formId }, { $push: { submissions: { customerId, submittedAt } } });

    return Forms.findOne({ _id: formId });
  }
}

FormSchema.loadClass(Form);

const Forms = model<IFormDocument, IFormModel>('forms', FormSchema);

export default Forms;
