import { Users, IMessageEngageData } from '../../db/models';

export default {
  fromUser(engageData: IMessageEngageData) {
    return Users.findOne({ _id: engageData.fromUserId });
  },
};
