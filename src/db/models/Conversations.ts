import { Model, model } from 'mongoose';
import * as Random from 'meteor-random';
import { mutateAppApi } from '../../utils';
import { IConversationDocument, ConversationSchema } from './definations/conversations';
import { CONVERSATION_STATUSES } from './definations/constants';

interface STATUSES {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ALL_LIST: ['new', 'open', 'closed'],
};

interface IConversationModel extends Model<IConversationDocument> {
  getConversationStatuses(): STATUSES

  createConversation({
    integrationId,
    userId,
    customerId,
    content
  } : {
    integrationId: string,
    userId?: string,
    customerId: string,
    content: string
  }): Promise<IConversationDocument>

  getOrCreateConversation({
    conversationId,
    integrationId,
    customerId,
    message
  } : {
    conversationId?: string,
    integrationId: string,
    customerId: string,
    message: string
  }): Promise<IConversationDocument>
}

class Conversation {
  static getConversationStatuses() {
    return CONVERSATION_STATUSES;
  }

  /**
   * Create new conversation
   * @param  {Object} conversationObj
   * @return {Promise} Newly created conversation object
   */
  static async createConversation(conversationObj) {
    const { integrationId, userId, customerId, content } = conversationObj;

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
   * @param  {Object} doc
   * @return {Promise}
   */
  static getOrCreateConversation(doc) {
    const { conversationId, integrationId, customerId, message } = doc;

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
      content: message,
    });
  }
}

ConversationSchema.loadClass(Conversation);

const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations', ConversationSchema
);

export default Conversations;
