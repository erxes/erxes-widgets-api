import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { ROLES } from "./constants";

interface IEmailSignature extends Document {
  brandId: string;
  signature: string;
}

interface IDetail extends Document {
  avatar: string;
  fullName: string;
  position: string;
  location?: string;
  description: string;
}

interface ILink extends Document {
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  youtube?: string;
  website?: string;
}

export interface IUserDocument extends Document {
  username: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  role: string;
  isOwner: boolean;
  email: string;
  getNotificationByEmail: boolean;
  emailSignatures: IEmailSignature[];
  starredConversationIds: string[];
  details: IDetail;
  links: ILink[];
}

const SALT_WORK_FACTOR = 10;

// Mongoose schemas ===============================
const emailSignatureSchema = new Schema(
  {
    brandId: field({ type: String }),
    signature: field({ type: String })
  },
  { _id: false }
);

// Detail schema
const detailSchema = new Schema(
  {
    avatar: field({ type: String }),
    fullName: field({ type: String }),
    position: field({ type: String }),
    location: field({ type: String, optional: true }),
    description: field({ type: String, optional: true })
  },
  { _id: false }
);

const linkSchema = new Schema(
  {
    linkedIn: field({ type: String, optional: true }),
    twitter: field({ type: String, optional: true }),
    facebook: field({ type: String, optional: true }),
    github: field({ type: String, optional: true }),
    youtube: field({ type: String, optional: true }),
    website: field({ type: String, optional: true })
  },
  { _id: false }
);

// User schema
export const userSchema = new Schema({
  _id: field({ pkey: true }),
  username: field({ type: String }),
  password: field({ type: String }),
  resetPasswordToken: field({ type: String }),
  resetPasswordExpires: field({ type: Date }),
  role: field({
    type: String,
    enum: [ROLES.ADMIN, ROLES.CONTRIBUTOR]
  }),
  isOwner: field({ type: Boolean }),
  email: field({
    type: String,
    lowercase: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address"
    ]
  }),
  getNotificationByEmail: field({ type: Boolean }),
  emailSignatures: field({ type: [emailSignatureSchema] }),
  starredConversationIds: field({ type: [String] }),
  details: field({ type: detailSchema }),
  links: field({ type: linkSchema, default: {} })
});
