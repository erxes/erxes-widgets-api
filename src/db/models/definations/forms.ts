import { Schema, Document } from 'mongoose';
import * as Random from 'meteor-random';
import { field } from '../utils';

interface ICallout {
  title?: string,
  body?: string,
  buttonText?: string,
  featuredImage?: string,
  skip?: boolean,
}

interface ISubmission {
  customerId: string,
  submittedAt: Date,
}

export interface IFormDocument extends Document {
  _id: string,
  title: string,
  code: string,
  description?: string,
  buttonText?: string,
  themeColor?: string,
  createdUserId: string,
  createdDate: Date,
  callout: ICallout,
  viewCount: number,
  contactsGathered: number,
  submissions: ISubmission[],
}

// schema for form's callout component
const CalloutSchema = new Schema(
  {
    title: field({ type: String, optional: true }),
    body: field({ type: String, optional: true }),
    buttonText: field({ type: String, optional: true }),
    featuredImage: field({ type: String, optional: true }),
    skip: field({ type: Boolean, optional: true }),
  },
  { _id: false },
);

// schema for form submission details
const SubmissionSchema = new Schema(
  {
    customerId: field({ type: String }),
    submittedAt: field({ type: Date }),
  },
  { _id: false },
);

// schema for form document
export const FormSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  description: field({
    type: String,
    optional: true,
  }),
  buttonText: field({ type: String, optional: true }),
  themeColor: field({ type: String, optional: true }),
  code: field({ type: String }),
  createdUserId: field({ type: String }),
  createdDate: field({
    type: Date,
    default: Date.now,
  }),
  callout: field({ type: CalloutSchema, default: {} }),
  viewCount: field({ type: Number }),
  contactsGathered: field({ type: Number }),
  submissions: field({ type: [SubmissionSchema] }),
});
