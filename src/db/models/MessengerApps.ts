import { Model, model } from "mongoose";
import {
  IMessengerAppDocument,
  messengerAppSchema
} from "./definitions/messengerApps";

interface IMessengerAppModel extends Model<IMessengerAppDocument> {}

const MessengerApps = model<IMessengerAppDocument, IMessengerAppModel>(
  "messenger_apps",
  messengerAppSchema
);

export default MessengerApps;
