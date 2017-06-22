import mongoose from 'mongoose';
import Random from 'meteor-random';

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
  formWidgetData: Object,
});

const Messages = mongoose.model('conversation_messages', MessageSchema);

export default Messages;
