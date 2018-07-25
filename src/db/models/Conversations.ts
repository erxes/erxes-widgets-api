import { Model, model } from 'mongoose';
import { mutateAppApi } from '../../utils';
import { IConversationDocument, ConversationSchema } from './definations/conversations';
import { CONVERSATION_STATUSES } from './definations/constants';

interface STATUSES {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ALL_LIST: ['new', 'open', 'closed'],
};

interface IConversationParams {
  conversationId?: string,
  userId?: string,
  integrationId: string,
  customerId: string,
  content: string
}

interface IConversationModel extends Model<IConversationDocument> {
  getConversationStatuses(): STATUSES
  createConversation(doc : IConversationParams): Promise<IConversationDocument>
  getOrCreateConversation(doc : IConversationParams): Promise<IConversationDocument>
}

class Conversation {
  static getConversationStatuses() {
    return CONVERSATION_STATUSES;
  }

  /**
   * Create new conversation
   */
  static async createConversation(doc: IConversationParams) {
    const { integrationId, userId, customerId, content } = doc;

    const count = await Conversations.find({ customerId, integrationId }).count();

    const conversation = await Conversations.create({
      customerId,
      userId,
      integrationId,
      content,
      status: this.getConversationStatuses().NEW,
      createdAt: new Date(),
      messageCount: 0,

      // Number is used for denormalization of posts count
      number: count + 1,
    });

    // call app api's create conversation log
    mutateAppApi(`
      mutation {
        activityLogsAddConversationLog(
          conversationId: "${conversation._id}",
          customerId: "${customerId}",
        ) {
          _id
        }
      }`);

    return conversation;
  }

  /**
   * Get or create conversation
   */
  static getOrCreateConversation(doc: IConversationParams) {
    const { conversationId, integrationId, customerId, content } = doc;

    // customer can write a message
    // to the closed conversation even if it's closed
    if (conversationId) {
      return Conversations.findByIdAndUpdate(
        conversationId,
        {
          // mark this conversation as unread
          readUserIds: [],

          // reopen this conversation if it's closed
          status: this.getConversationStatuses().OPEN,
        },
        { new: true },
      );
    }

    // create conversation
    return this.createConversation({
      customerId,
      integrationId,
      content,
    });
  }
}

ConversationSchema.loadClass(Conversation);

const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations', ConversationSchema
);

export default Conversations;