import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { IRule } from './engages';

export interface ICallout extends Document {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  skip?: boolean;
}

interface ISubmission extends Document {
  customerId: string;
  submittedAt: Date;
}

export interface IForm {
  title: string;
  code?: string;
  description?: string;
  buttonText?: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IRule;
}

export interface IFormDocument extends IForm, Document {
  _id: string;
  createdUserId: string;
  createdDate: Date;
  viewCount: number;
  contactsGathered: number;
  submissions: ISubmission[];
}

// schema for form's callout component
const calloutSchema = new Schema(
  {
    title: field({ type: String, optional: true }),
    body: field({ type: String, optional: true }),
    buttonText: field({ type: String, optional: true }),
    featuredImage: field({ type: String, optional: true }),
    skip: field({ type: Boolean, optional: true }),
  },
  { _id: false },
);

// schema for form's rules
const rulesSchema = new Schema(
  {
    _id: field({ type: String }),

    // browserLanguage, currentUrl, etc ...
    kind: field({ type: String }),

    // Browser language, Current url etc ...
    text: field({ type: String }),

    // is, isNot, startsWith
    condition: field({ type: String }),

    value: field({ type: String }),
  },
  { _id: false },
);

// schema for form submission details
const submissionSchema = new Schema(
  {
    customerId: field({ type: String }),
    submittedAt: field({ type: Date }),
  },
  { _id: false },
);

// schema for form document
export const formSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String, optional: true }),
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
  callout: field({ type: calloutSchema, default: {} }),
  viewCount: field({ type: Number }),
  contactsGathered: field({ type: Number }),
  submissions: field({ type: [submissionSchema] }),
  rules: field({ type: [rulesSchema] }),
});
