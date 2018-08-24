import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IChannelDocument extends Document {
  _id: string;
  name: string;
  description?: string;
  integrationIds: string[];
  memberIds: string[];
  userId: string;
  conversationCount: number;
  openConversationCount: number;
}

export const channelSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  description: field({
    type: String,
    optional: true
  }),
  integrationIds: field({ type: [String] }),
  memberIds: field({ type: [String] }),
  userId: field({ type: String }),
  conversationCount: field({
    type: Number,
    default: 0
  }),
  openConversationCount: field({
    type: Number,
    default: 0
  })
});
