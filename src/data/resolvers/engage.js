import { Users } from '../../db/models';

export default {
  fromUser(engageData) {
    return Users.findOne({ _id: engageData.fromUserId });
  },
};
