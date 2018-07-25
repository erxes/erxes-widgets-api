import { Users, IMessageDocument } from "../../db/models";

export default {
  user(message: IMessageDocument) {
    return Users.findOne({ _id: message.userId });
  }
};
