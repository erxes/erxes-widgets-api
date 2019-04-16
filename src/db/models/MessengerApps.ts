import { Model, model } from 'mongoose';
import { IMessengerAppDocument, messengerAppSchema } from './definitions/messengerApps';

export interface IMessengerAppModel extends Model<IMessengerAppDocument> {}

export const loadClass = () => {
  return messengerAppSchema;
};

// tslint:disable-next-line
const MessengerApps = model<IMessengerAppDocument, IMessengerAppModel>('messenger_apps', messengerAppSchema);

export default MessengerApps;
