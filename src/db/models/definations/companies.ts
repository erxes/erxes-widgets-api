import { Document, Model, model, Schema } from "mongoose";

import {
  COMPANY_BASIC_INFOS,
  COMPANY_BUSINESS_TYPES,
  COMPANY_INDUSTRY_TYPES,
  COMPANY_LEAD_STATUS_TYPES,
  COMPANY_LIFECYCLE_STATE_TYPES
} from "./constants";

import { field } from "../utils";

interface ILink extends Document {
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  youtube?: string;
  website?: string;
}

export interface ICompanyDocument extends Document {
  _id: string;
  primaryName: string;
  names?: string[];
  size?: number;
  industry?: string;
  website?: string;
  parentCompanyId?: string;
  email?: string;
  ownerId?: string;
  phone?: string;
  leadStatus?: string;
  lifecycleState?: string;
  businessType?: string;
  description?: string;
  employees?: number;
  doNotDisturb?: string;
  links?: ILink;
  lastSeenAt?: Date;
  sessionCount: number;
  tagIds?: string[];
  customFieldsData?: any;
}

const linkSchema = new Schema(
  {
    linkedIn: field({ type: String, optional: true, label: "LinkedIn" }),
    twitter: field({ type: String, optional: true, label: "Twitter" }),
    facebook: field({ type: String, optional: true, label: "Facebook" }),
    github: field({ type: String, optional: true, label: "Github" }),
    youtube: field({ type: String, optional: true, label: "Youtube" }),
    website: field({ type: String, optional: true, label: "Website" })
  },
  { _id: false }
);

export const companySchema = new Schema({
  _id: field({ pkey: true }),

  primaryName: field({
    type: String,
    label: "Name"
  }),

  names: field({
    type: [String],
    optional: true
  }),

  size: field({
    type: Number,
    label: "Size",
    optional: true
  }),

  industry: field({
    type: String,
    enum: COMPANY_INDUSTRY_TYPES,
    label: "Industry",
    optional: true
  }),

  website: field({
    type: String,
    label: "Website",
    optional: true
  }),

  parentCompanyId: field({
    type: String,
    optional: true,
    label: "Parent Company"
  }),
  email: field({ type: String, optional: true, label: "Email" }),
  ownerId: field({ type: String, optional: true, label: "Owner" }),
  phone: field({ type: String, optional: true, label: "Phone" }),

  leadStatus: field({
    type: String,
    enum: COMPANY_LEAD_STATUS_TYPES,
    optional: true,
    label: "Lead Status"
  }),

  lifecycleState: field({
    type: String,
    enum: COMPANY_LIFECYCLE_STATE_TYPES,
    optional: true,
    label: "Lifecycle State"
  }),

  businessType: field({
    type: String,
    enum: COMPANY_BUSINESS_TYPES,
    optional: true,
    label: "Business Type"
  }),

  description: field({ type: String, optional: true }),
  employees: field({ type: Number, optional: true, label: "Employees" }),
  doNotDisturb: field({
    type: String,
    optional: true,
    label: "Do not disturb"
  }),
  links: field({ type: linkSchema, default: {} }),

  lastSeenAt: field({
    type: Date,
    label: "Last seen at"
  }),

  sessionCount: field({
    type: Number,
    label: "Session count"
  }),

  tagIds: field({
    type: [String],
    optional: true
  }),

  customFieldsData: field({
    type: Object
  })
});
