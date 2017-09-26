import { Messages, Users } from '../../db/models';

export default {
  participatedUsers(conversation) {
    return Users.find({ _id: { $in: conversation.participatedUserIds } });
  },

  messages(conversation) {
    return Messages.find({
      _id: conversation._id,
      internal: false,
    }).sort({ createdAt: 1 });
  },
};
