import { Schema, Model, model } from "mongoose";

import {
  IMessageDocument,
  MessageSchema
} from "./definations/conversationMessages";
import Conversations from "./Conversations";

interface IMessageParams {
  conversationId: string;
  content: string;
  customerId?: string;
  userId?: string;
  attachments?: any;
  engageData?: any;
  formWidgetData?: any;
}

interface IMessageModel extends Model<IMessageDocument> {
  createMessage(doc: IMessageParams): Promise<IMessageDocument>;
  forceReadCustomerPreviousEngageMessages(
    customerId: string
  ): Promise<IMessageDocument>;
}

class Message {
  /*
   * Create new message
   */
  static async createMessage(doc: IMessageParams) {
    const conversation = await Conversations.findOne({
      _id: doc.conversationId
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // increment messageCount
    await Conversations.findByIdAndUpdate(
      conversation._id,
      {
        messageCount: conversation.messageCount + 1,
        updatedAt: new Date()
      },
      { new: true }
    );

    // create message
    return Messages.create({
      createdAt: new Date(),
      internal: false,
      ...doc
    });
  }

  // force read previous unread engage messages ============
  static forceReadCustomerPreviousEngageMessages(customerId: string) {
    return Messages.update(
      {
        customerId,
        engageData: { $exists: true },
        isCustomerRead: { $ne: true }
      },
      { $set: { isCustomerRead: true } },
      { multi: true }
    );
  }
}

MessageSchema.loadClass(Message);

const Messages = model<IMessageDocument, IMessageModel>(
  "conversation_messages",
  MessageSchema
);

export default Messages;
