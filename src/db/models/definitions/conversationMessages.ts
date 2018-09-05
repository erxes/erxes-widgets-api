import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { ITwitterResponse, twitterResponseSchema } from "./conversations";

export interface IFbUser {
  id: string;
  name: string;
}

export interface IReactions {
  like?: IFbUser[];
  love?: IFbUser[];
  wow?: IFbUser[];
  haha?: IFbUser[];
  sad?: IFbUser[];
  angry?: IFbUser[];
}

export interface IFacebook {
  postId?: string;
  commentId?: string;
  parentId?: string;
  isPost?: boolean;
  reactions?: IReactions;
  likeCount?: number;
  commentCount?: number;
  messageId?: string;
  item?: string;
  photo?: string;
  video?: string;
  photos?: string[];
  link?: string;
  senderId?: string;
  senderName?: string;
}

interface IFacebookDataDocument extends IFacebook, Document {}

export interface IEngageData {
  messageId: string;
  brandId: string;
  content: string;
  fromUserId: string;
  kind: string;
  sentAs: string;
}

interface IEngageDataDocument extends IEngageData, Document {}

export interface IMessage {
  content?: string;
  attachments?: any;
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  customerId?: string;
  userId?: string;
  isCustomerRead?: boolean;
  formWidgetData?: any;
  engageData?: IEngageDataDocument;
  facebookData?: IFacebookDataDocument;
  twitterData?: ITwitterResponse;
}

export interface IMessageDocument extends IMessage, Document {
  _id: string;
  createdAt: Date;
}

const attachmentSchema = new Schema({
  url: field({ type: String }),
  name: field({ type: String }),
  size: field({ type: Number }),
  type: field({ type: String })
});

const fbUserSchema = new Schema(
  {
    id: field({ type: String, optional: true }),
    name: field({ type: String, optional: true })
  },
  { _id: false }
);

// Post or comment's reaction data
const reactionSchema = new Schema(
  {
    like: field({ type: [fbUserSchema], default: [] }),
    love: field({ type: [fbUserSchema], default: [] }),
    wow: field({ type: [fbUserSchema], default: [] }),
    haha: field({ type: [fbUserSchema], default: [] }),
    sad: field({ type: [fbUserSchema], default: [] }),
    angry: field({ type: [fbUserSchema], default: [] })
  },
  { _id: false }
);

const facebookSchema = new Schema(
  {
    postId: field({
      type: String,
      optional: true
    }),

    commentId: field({
      type: String,
      optional: true
    }),

    // parent comment id
    parentId: field({
      type: String,
      optional: true
    }),

    isPost: field({
      type: Boolean,
      optional: true
    }),

    reactions: field({ type: reactionSchema, default: {} }),

    likeCount: field({
      type: Number,
      default: 0
    }),
    commentCount: field({
      type: Number,
      default: 0
    }),

    // messenger message id
    messageId: field({
      type: String,
      optional: true
    }),

    // comment, reaction, etc ...
    item: field({
      type: String,
      optional: true
    }),

    // photo link when included photo
    photo: field({
      type: String,
      optional: true
    }),

    // video link when included video
    video: field({
      type: String,
      optional: true
    }),

    // photo links when user posted multiple photos
    photos: field({
      type: [String],
      optional: true
    }),

    link: field({
      type: String,
      optional: true
    }),

    senderId: field({
      type: String,
      optional: true
    }),

    senderName: field({
      type: String,
      optional: true
    })
  },
  { _id: false }
);

const engageDataSchema = new Schema({
  messageId: field({ type: String }),
  brandId: field({ type: String }),
  content: field({ type: String }),
  fromUserId: field({ type: String }),
  kind: field({ type: String }),
  sentAs: field({ type: String })
});

export const messageSchema = new Schema({
  _id: field({ pkey: true }),
  content: field({ type: String }),
  attachments: [attachmentSchema],
  mentionedUserIds: field({ type: [String] }),
  conversationId: field({ type: String }),
  internal: field({ type: Boolean }),
  customerId: field({ type: String }),
  userId: field({ type: String }),
  createdAt: field({ type: Date }),
  isCustomerRead: field({ type: Boolean }),
  formWidgetData: field({ type: Object }),
  engageData: field({ type: engageDataSchema }),
  facebookData: field({ type: facebookSchema }),
  twitterData: field({ type: twitterResponseSchema }),
  messengerAppData: field({ type: Object })
});
