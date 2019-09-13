import { Model, model } from 'mongoose';
import {
  formSchema,
  formSubmissionSchema,
  IFormDocument,
  IFormSubmission,
  IFormSubmissionDocument,
} from './definitions/forms';

export interface IFormModel extends Model<IFormDocument> {}

export interface IFormSubmissionModel extends Model<IFormSubmissionDocument> {
  createFormSubmission(doc: IFormSubmission): Promise<IFormSubmissionDocument>;
}

export const loadFormSubmissionClass = () => {
  class FormSubmission {
    /**
     * Creates a form submission
     */
    public static async createFormSubmission(doc: IFormSubmission) {
      return FormSubmissions.create(doc);
    }
  }

  formSubmissionSchema.loadClass(FormSubmission);

  return formSubmissionSchema;
};

loadFormSubmissionClass();

// tslint:disable-next-line
const Forms = model<IFormDocument, IFormModel>('forms', formSchema);

// tslint:disable-next-line
const FormSubmissions = model<IFormSubmissionDocument, IFormSubmissionModel>('form_submissions', formSubmissionSchema);

export { Forms, FormSubmissions };
