import { Model, model } from 'mongoose';
import { configSchema, IConfigDocument } from './definitions/configs';

interface IConfigModel extends Model<IConfigDocument> {}

// tslint:disable-next-line
const Configs = model<IConfigDocument, IConfigModel>('configs', configSchema);

export default Configs;
