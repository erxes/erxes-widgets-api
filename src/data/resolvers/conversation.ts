import { Conversations, IConversationDocument, Users } from "../../db/models";

export default {
  participatedUsers(conversation: IConversationDocument) {
    return Users.find({ _id: { $in: conversation.participatedUserIds } });
  },

  messages(conversation: IConversationDocument) {
    return Conversations.getMessages(conversation._id);
  }
};
