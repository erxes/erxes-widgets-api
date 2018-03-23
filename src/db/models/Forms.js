import mongoose from 'mongoose';
import Random from 'meteor-random';

const FormSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: String,
  code: String,
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
}

FormSchema.loadClass(Form);

const Forms = mongoose.model('forms', FormSchema);

export default Forms;
