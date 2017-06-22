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

const Conversations = mongoose.model('conversations', ConversationSchema);

export default Conversations;
