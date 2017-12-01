import mongoose from 'mongoose';
import Random from 'meteor-random';
import { mutateAppApi } from '../../utils';

const ConversationSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  createdAt: Date,
  updatedAt: Date,
  content: String,
  customerId: String,
  userId: String,
  integrationId: String,
  number: Number,
  messageCount: Number,
  status: String,
  readUserIds: [String],
  participatedUserIds: [String],
});

class Conversation {
  static getConversationStatuses() {
    return {
      NEW: 'new',
      OPEN: 'open',
      CLOSED: 'closed',
      ALL_LIST: ['new', 'open', 'closed'],
    };
  }

  /**
   * Create new conversation
   * @param  {Object} conversationObj
   * @return {Promise} Newly created conversation object
   */
  static async createConversation(conversationObj) {
    const { integrationId, userId, customerId, content } = conversationObj;

    const count = await this.find({ customerId, integrationId }).count();

    const conversation = await this.create({
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
      return this.findByIdAndUpdate(
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

const Conversations = mongoose.model('conversations', ConversationSchema);

export default Conversations;
