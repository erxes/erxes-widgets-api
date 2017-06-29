import { Users } from '../../db/models';

export default {
  participatedUsers(conversation) {
    return Users.find({ _id: { $in: conversation.participatedUserIds } });
  },
};
