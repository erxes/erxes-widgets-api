import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { MESSENGER_KINDS, METHODS, SENT_AS_CHOICES } from "./constants";

interface IEmail extends Document {
  templateId?: string;
  subject: string;
  content: string;
}

interface IRule extends Document {
  _id: string;
  kind: string;
  text: string;
  condition: string;
  value: string;
}

interface IMessenger extends Document {
  brandId: string;
  kind: string;
  sentAs: string;
  content: string;
  rules: IRule[];
}

interface IStats {
  open: number;
  click: number;
  complaint: number;
  delivery: number;
  bounce: number;
  reject: number;
  send: number;
  renderingfailure: number;
}

export interface IEngageMessageDocument extends Document {
  _id: string;
  kind: string;
  segmentId?: string;
  customerIds: string[];
  title: string;
  fromUserId: string;
  method: string;
  isDraft: boolean;
  isLive: boolean;
  stopDate: Date;
  createdDate: Date;
  tagIds: string[];
  messengerReceivedCustomerIds: string[];
  email: IEmail;
  messenger: IMessenger;
  deliveryReports: any;
  stats: IStats;
}

// Mongoose schemas =======================
const emailSchema = new Schema(
  {
    templateId: field({
      type: String,
      optional: true
    }),
    subject: field({ type: String }),
    content: field({ type: String })
  },
  { _id: false }
);

const ruleSchema = new Schema(
  {
    _id: field({ type: String }),

    // browserLanguage, currentUrl, etc ...
    kind: field({ type: String }),

    // Browser language, Current url etc ...
    text: field({ type: String }),

    // is, isNot, startsWith
    condition: field({ type: String }),

    value: field({ type: String })
  },
  { _id: false }
);

const messengerSchema = new Schema(
  {
    brandId: field({ type: String }),
    kind: field({
      type: String,
      enum: MESSENGER_KINDS.ALL
    }),
    sentAs: field({
      type: String,
      enum: SENT_AS_CHOICES.ALL
    }),
    content: field({ type: String }),
    rules: field({ type: [ruleSchema] })
  },
  { _id: false }
);

const statsSchema = new Schema(
  {
    open: field({ type: Number }),
    click: field({ type: Number }),
    complaint: field({ type: Number }),
    delivery: field({ type: Number }),
    bounce: field({ type: Number }),
    reject: field({ type: Number }),
    send: field({ type: Number }),
    renderingfailure: field({ type: Number })
  },
  { _id: false }
);

export const engageMessageSchema = new Schema({
  _id: field({ pkey: true }),
  kind: field({ type: String }),
  segmentId: field({
    type: String,
    optional: true
  }),
  customerIds: field({ type: [String] }),
  title: field({ type: String }),
  fromUserId: field({ type: String }),
  method: field({
    type: String,
    enum: METHODS.ALL
  }),
  isDraft: field({ type: Boolean }),
  isLive: field({ type: Boolean }),
  stopDate: field({ type: Date }),
  createdDate: field({ type: Date }),
  tagIds: field({ type: [String] }),
  messengerReceivedCustomerIds: field({ type: [String] }),

  email: field({ type: emailSchema }),
  messenger: field({ type: messengerSchema }),
  deliveryReports: field({ type: Object }),
  stats: field({ type: statsSchema, default: {} })
});
