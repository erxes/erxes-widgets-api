import { Schema, Document } from 'mongoose';
import { field } from '../utils';
import { TwitterResponseSchema, ITwitterResponse } from './conversations';

interface IFacebook extends Document {
  postId?: string,
  commentId?: string,
  parentId?: string,
  messageId?: string,
  item?: string,
  photoId?: string,
  videoId?: string,
  link?: string,
  reactionType?: string,
  senderId?: string,
  senderName?: string,
}

interface IAttachment extends Document {
  url: string,
  name: string,
  size: number,
  type: string,
}

export interface IEngageData {
  messageId: string
  brandId: string
  content: string
  fromUserId: string
  kind: string
  sentAs: string
}

export interface IMessageDocument extends Document {
  _id: string,
  content: string,
  attachments: any,
  mentionedUserIds: string[],
  conversationId: string,
  internal: boolean,
  customerId: string,
  userId: string,
  createdAt: Date,
  isCustomerRead: boolean,
  formWidgetData: any,
  engageData: IEngageData,
  facebookData: IFacebook,
  twitterData: ITwitterResponse,
};

const AttachmentSchema = new Schema({
  url: field({ type: String }),
  name: field({ type: String }),
  size: field({ type: Number }),
  type: field({ type: String }),
});

const FacebookSchema = new Schema(
  {
    postId: field({
      type: String,
      optional: true,
    }),

    commentId: field({
      type: String,
      optional: true,
    }),

    parentId: field({
      type: String,
      optional: true,
    }),

    // messenger message id
    messageId: field({
      type: String,
      optional: true,
    }),

    // comment, reaction, etc ...
    item: field({
      type: String,
      optional: true,
    }),

    // when share photo
    photoId: field({
      type: String,
      optional: true,
    }),

    // when share video
    videoId: field({
      type: String,
      optional: true,
    }),

    link: field({
      type: String,
      optional: true,
    }),

    reactionType: field({
      type: String,
      optional: true,
    }),

    senderId: field({
      type: String,
      optional: true,
    }),

    senderName: field({
      type: String,
      optional: true,
    }),
  },
  { _id: false },
);

const EngageDataSchema = new Schema({
  messageId: field({ type: String }),
  brandId: field({ type: String }),
  content: field({ type: String }),
  fromUserId: field({ type: String }),
  kind: field({ type: String }),
  sentAs: field({ type: String }),
});

export const MessageSchema = new Schema({
  _id: field({ pkey: true }),
  content: field({ type: String }),
  attachments: [AttachmentSchema],
  mentionedUserIds: field({ type: [String] }),
  conversationId: field({ type: String }),
  internal: field({ type: Boolean }),
  customerId: field({ type: String }),
  userId: field({ type: String }),
  createdAt: field({ type: Date }),
  isCustomerRead: field({ type: Boolean }),
  formWidgetData: field({ type: Object }),
  engageData: field({ type: EngageDataSchema }),
  facebookData: field({ type: FacebookSchema }),
  twitterData: field({ type: TwitterResponseSchema }),
});
