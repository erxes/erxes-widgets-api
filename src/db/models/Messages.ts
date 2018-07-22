import { Schema, Model, model } from 'mongoose';
import * as Random from 'meteor-random';

import { IMessageDocument, MessageSchema } from './definations/conversationMessages';
import Conversations from './Conversations';

interface IMessageModel extends Model<IMessageDocument> {
  createMessage({
    conversationId,
    customerId,
    userId,
    content: message,
    attachments,
    engageData,
    formWidgetData,
  } : {
    conversationId: string,
    content: string,
    customerId?: string,
    userId?: string,
    attachments?: object[],
    engageData?: object,
    formWidgetData?: object[],
  }): Promise<IMessageDocument>

  forceReadCustomerPreviousEngageMessages(
    customerId: string
  ): Promise<IMessageDocument>
}

class Message {
  /**
   * Create new message
   * @param  {Object} messageObj
   * @return {Promise} New message
   */
  static async createMessage(messageObj) {
    const conversation = await Conversations.findOne({
      _id: messageObj.conversationId,
    });

    // increment messageCount
    await Conversations.findByIdAndUpdate(
      conversation._id,
      {
        messageCount: conversation.messageCount + 1,
        updatedAt: new Date(),
      },
      { new: true },
    );

    // create message
    return Messages.create({
      createdAt: new Date(),
      internal: false,
      ...messageObj,
    });
  }

  // force read previous unread engage messages ============
  static forceReadCustomerPreviousEngageMessages(customerId) {
    return Messages.update(
      {
        customerId,
        engageData: { $exists: true },
        isCustomerRead: { $ne: true },
      },
      { $set: { isCustomerRead: true } },
      { multi: true },
    );
  }
}

MessageSchema.loadClass(Message);

const Messages = model<IMessageDocument, IMessageModel>(
  'conversation_messages', MessageSchema
);

export default Messages;
