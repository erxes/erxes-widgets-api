import { Model, model } from 'mongoose';

import Conversations from './Conversations';
import { IMessageDocument, messageSchema } from './definitions/conversationMessages';

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
  forceReadCustomerPreviousEngageMessages(customerId: string): Promise<IMessageDocument>;
}

export const loadClass = () => {
  class Message {
    /*
     * Create new message
     */
    public static async createMessage(doc: IMessageParams) {
      const conversation = await Conversations.findOne({
        _id: doc.conversationId,
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

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
        ...doc,
      });
    }

    // force read previous unread engage messages ============
    public static forceReadCustomerPreviousEngageMessages(customerId: string) {
      return Messages.updateMany(
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

  messageSchema.loadClass(Message);
};

loadClass();

// tslint:disable-next-line
const Messages = model<IMessageDocument, IMessageModel>('conversation_messages', messageSchema);

export default Messages;
