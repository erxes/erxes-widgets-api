import { Model, model } from 'mongoose';
import { IMessengerAppDocument, messengerAppSchema } from './definitions/messengerApps';

interface IMessengerAppModel extends Model<IMessengerAppDocument> {}

// tslint:disable-next-line
const MessengerApps = model<IMessengerAppDocument, IMessengerAppModel>('messenger_apps', messengerAppSchema);

export default MessengerApps;
