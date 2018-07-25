import { Messages, Users, IConversationDocument } from '../../db/models';

export default {
  participatedUsers(conversation: IConversationDocument) {
    return Users.find({ _id: { $in: conversation.participatedUserIds } });
  },

  messages(conversation: IConversationDocument) {
    return Messages.find({
      conversationId: conversation._id,
      internal: false,
    }).sort({ createdAt: 1 });
  },
};
