import { Model, model } from 'mongoose';
import { configSchema, IConfigDocument } from './definitions/configs';

interface IConfigModel extends Model<IConfigDocument> {}

export const loadClass = () => {
  return configSchema;
};

// tslint:disable-next-line
const Configs = model<IConfigDocument, IConfigModel>('configs', configSchema);

export default Configs;
