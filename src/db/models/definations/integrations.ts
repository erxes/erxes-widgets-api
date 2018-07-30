import { Document, Schema } from "mongoose";
import { field } from "../utils";
import {
  FORM_LOAD_TYPES,
  FORM_SUCCESS_ACTIONS,
  KIND_CHOICES,
  LANGUAGE_CHOICES,
  MESSENGER_DATA_AVAILABILITY
} from "./constants";

interface ITwitterData extends Document {
  info: any;
  token: string;
  tokenSecret: string;
}

interface IFacebookData extends Document {
  appId: {
    type: string;
  };
  pageIds: {
    type: string[];
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
const twitterSchema = new Schema(
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

const facebookSchema = new Schema(
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
const messengerOnlineHoursSchema = new Schema(
  {
    day: field({ type: String }),
    from: field({ type: String }),
    to: field({ type: String })
  },
  { _id: false }
);

// subdocument schema for MessengerData
const messengerDataSchema = new Schema(
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
    onlineHours: field({ type: [messengerOnlineHoursSchema] }),
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
const formDataSchema = new Schema(
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
const uiOptionsSchema = new Schema(
  {
    color: field({ type: String }),
    wallpaper: field({ type: String }),
    logo: field({ type: String })
  },
  { _id: false }
);

// schema for integration document
export const integrationSchema = new Schema({
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
  formData: field({ type: formDataSchema }),
  messengerData: field({ type: messengerDataSchema }),
  twitterData: field({ type: twitterSchema }),
  facebookData: field({ type: facebookSchema }),
  uiOptions: field({ type: uiOptionsSchema })
});
