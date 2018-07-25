import { Document, Schema } from "mongoose";
import { field } from "../utils";
import {
  LANGUAGE_CHOICES,
  KIND_CHOICES,
  FORM_SUCCESS_ACTIONS,
  FORM_LOAD_TYPES,
  MESSENGER_DATA_AVAILABILITY
} from "./constants";

interface ITwitterData extends Document {
  info: any;
  token: string;
  tokenSecret: string;
}

interface IFacebookData extends Document {
  appId: {
    type: String;
  };
  pageIds: {
    type: [String];
  };
}

interface IMessengerOnlineHours extends Document {
  day: string;
  from: string;
  to: string;
}

interface IMessengerData extends Document {
  supporterIds: string[];
  notifyCustomer: boolean;
  availabilityMethod: string;
  isOnline: boolean;
  onlineHours: IMessengerOnlineHours[];
  timezone?: string;
  welcomeMessage?: string;
  awayMessage?: string;
  thankYouMessage?: string;
}

interface IFormData extends Document {
  loadType: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string;
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankContent?: string;
  redirectUrl?: string;
}

// subdocument schema for messenger UiOptions
interface IUiOptions extends Document {
  color: string;
  wallpaper: string;
  logo: string;
}

export interface IIntegrationDocument extends Document {
  _id: string;
  kind: string;
  name: string;
  brandId: string;
  languageCode?: string;
  tagIds?: string[];
  formId: string;
  formData: IFormData;
  messengerData: IMessengerData;
  twitterData: ITwitterData;
  facebookData: IFacebookData;
  uiOptions: IUiOptions;
}

// Mongoose schemas ======================
const TwitterSchema = new Schema(
  {
    info: {
      type: Object
    },
    token: {
      type: String
    },
    tokenSecret: {
      type: String
    }
  },
  { _id: false }
);

const FacebookSchema = new Schema(
  {
    appId: {
      type: String
    },
    pageIds: {
      type: [String]
    }
  },
  { _id: false }
);

// subdocument schema for MessengerOnlineHours
const MessengerOnlineHoursSchema = new Schema(
  {
    day: field({ type: String }),
    from: field({ type: String }),
    to: field({ type: String })
  },
  { _id: false }
);

// subdocument schema for MessengerData
const MessengerDataSchema = new Schema(
  {
    supporterIds: field({ type: [String] }),
    notifyCustomer: field({ type: Boolean }),
    availabilityMethod: field({
      type: String,
      enum: MESSENGER_DATA_AVAILABILITY.ALL
    }),
    isOnline: field({
      type: Boolean
    }),
    onlineHours: field({ type: [MessengerOnlineHoursSchema] }),
    timezone: field({
      type: String,
      optional: true
    }),
    welcomeMessage: field({ type: String, optional: true }),
    awayMessage: field({ type: String, optional: true }),
    thankYouMessage: field({ type: String, optional: true })
  },
  { _id: false }
);

// subdocument schema for FormData
const FormDataSchema = new Schema(
  {
    loadType: field({
      type: String,
      enum: FORM_LOAD_TYPES.ALL
    }),
    successAction: field({
      type: String,
      enum: FORM_SUCCESS_ACTIONS.ALL,
      optional: true
    }),
    fromEmail: field({
      type: String,
      optional: true
    }),
    userEmailTitle: field({
      type: String,
      optional: true
    }),
    userEmailContent: field({
      type: String,
      optional: true
    }),
    adminEmails: field({
      type: [String],
      optional: true
    }),
    adminEmailTitle: field({
      type: String,
      optional: true
    }),
    adminEmailContent: field({
      type: String,
      optional: true
    }),
    thankContent: field({
      type: String,
      optional: true
    }),
    redirectUrl: field({
      type: String,
      optional: true
    })
  },
  { _id: false }
);

// subdocument schema for messenger UiOptions
const UiOptionsSchema = new Schema(
  {
    color: field({ type: String }),
    wallpaper: field({ type: String }),
    logo: field({ type: String })
  },
  { _id: false }
);

// schema for integration document
export const IntegrationSchema = new Schema({
  _id: field({ pkey: true }),

  kind: field({
    type: String,
    enum: KIND_CHOICES.ALL
  }),

  name: field({ type: String }),
  brandId: field({ type: String }),

  languageCode: field({
    type: String,
    enum: LANGUAGE_CHOICES,
    optional: true
  }),
  tagIds: field({ type: [String], optional: true }),
  formId: field({ type: String }),
  formData: field({ type: FormDataSchema }),
  messengerData: field({ type: MessengerDataSchema }),
  twitterData: field({ type: TwitterSchema }),
  facebookData: field({ type: FacebookSchema }),
  uiOptions: field({ type: UiOptionsSchema })
});
