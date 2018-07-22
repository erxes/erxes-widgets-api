import * as mongoose from 'mongoose';
import * as Random from 'meteor-random';

import Conversations from './Conversations';

const AttachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
});

const MessageSchema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  userId: String,
  conversationId: String,
  customerId: String,
  content: String,
  attachments: [AttachmentSchema],
  createdAt: Date,
  isCustomerRead: Boolean,
  internal: Boolean,
  engageData: Object,
  formWidgetData: Object,
});

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

const Messages = mongoose.model('conversation_messages', MessageSchema);

export default Messages;
