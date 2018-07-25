import { Users } from '../../db/models';

export default {
  fromUser(engageData: any) {
    return Users.findOne({ _id: engageData.fromUserId });
  },
};
