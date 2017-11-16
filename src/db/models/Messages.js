import mongoose from 'mongoose';
import Random from 'meteor-random';

import Conversations from './Conversations';

const AttachmentSchema = mongoose.Schema({
  url: String,
  name: String,
  size: Number,
  type: String,
});

const MessageSchema = mongoose.Schema({
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
    return this.create({
      createdAt: new Date(),
      internal: false,
      ...messageObj,
    });
  }
}

MessageSchema.loadClass(Message);

const Messages = mongoose.model('conversation_messages', MessageSchema);

export default Messages;
