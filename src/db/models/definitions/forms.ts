import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IForm {
  title: string;
  code?: string;
  type: string;
  description?: string;
  buttonText?: string;
}

export interface IFormDocument extends IForm, Document {
  _id: string;
  createdUserId: string;
  createdDate: Date;
}

// schema for form document
export const formSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String, optional: true }),
    description: field({
      type: String,
      optional: true,
    }),
    buttonText: field({ type: String, optional: true }),
    code: field({ type: String }),
    createdUserId: field({ type: String }),
    createdDate: field({
      type: Date,
      default: Date.now,
    }),
  }),
);

export interface IFormSubmission {
  customerId: string;
  formId: string;
  submittedAt?: Date;
}

export interface IFormSubmissionDocument extends IFormSubmission, Document {
  _id: string;
}

// schema for form submission document
export const formSubmissionSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    customerId: field({ type: String }),
    submittedAt: field({ type: Date, default: Date.now }),
    formId: field({ type: String }),
  }),
);
