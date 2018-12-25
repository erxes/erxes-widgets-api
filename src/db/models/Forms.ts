import { Model, model } from "mongoose";
import { formSchema, IFormDocument } from "./definitions/forms";

interface IFormModel extends Model<IFormDocument> {
  increaseViewCount(formId: string): Promise<IFormDocument>;
  increaseContactsGathered(formId: string): Promise<IFormDocument>;
  addSubmission(formId: string, customerId: string): Promise<IFormDocument>;
}

class Form {
  /*
   * Increase form view count
   */
  public static async increaseViewCount(formId: string) {
    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      throw new Error("Form not found");
    }

    let viewCount = 0;

    if (form.viewCount) {
      viewCount = form.viewCount;
    }

    viewCount++;

    await Forms.updateOne({ _id: formId }, { viewCount });

    return Forms.findOne({ _id: formId });
  }

  /*
   * Increase form submitted count
   */
  public static async increaseContactsGathered(formId: string) {
    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      throw new Error("Form not found");
    }

    let contactsGathered = 0;

    if (form.contactsGathered) {
      contactsGathered = form.contactsGathered;
    }

    contactsGathered++;

    await Forms.updateOne({ _id: formId }, { contactsGathered });

    return Forms.findOne({ _id: formId });
  }

  /*
   * Add customer to submitted customer ids
   */
  public static async addSubmission(formId: string, customerId: string) {
    const submittedAt = new Date();

    await Forms.updateOne(
      { _id: formId },
      { $push: { submissions: { customerId, submittedAt } } }
    );

    return Forms.findOne({ _id: formId });
  }
}

formSchema.loadClass(Form);

// tslint:disable-next-line
const Forms = model<IFormDocument, IFormModel>("forms", formSchema);

export default Forms;
