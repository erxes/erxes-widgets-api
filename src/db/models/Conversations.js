import mongoose from 'mongoose';
import Random from 'meteor-random';

const ConversationSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  createdAt: Date,
  content: String,
  customerId: String,
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
  static createConversation(conversationObj) {
    const { integrationId, customerId, content } = conversationObj;

    return this.find({ customerId, integrationId }).count().then(count =>
      this.create({
        customerId,
        integrationId,
        content,
        status: this.getConversationStatuses().NEW,
        createdAt: new Date(),
        messageCount: 0,

        // Number is used for denormalization of posts count
        number: count + 1,
      }),
    );
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
