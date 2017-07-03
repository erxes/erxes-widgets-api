import { Users } from '../../db/models';

export default {
  user(message) {
    return Users.findOne({ _id: message.userId });
  },
};
