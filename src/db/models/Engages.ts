import { Model, model } from 'mongoose';
import { engageMessageSchema, IEngageMessageDocument } from './definitions/engages';

interface IEngageMessageModel extends Model<IEngageMessageDocument> {}

export const loadClass = () => {
  class EngageMessage {}

  engageMessageSchema.loadClass(EngageMessage);

  return engageMessageSchema;
};

loadClass();

// tslint:disable-next-line
export const EngageMessages = model<IEngageMessageDocument, IEngageMessageModel>(
  'engage_messages',
  engageMessageSchema,
);
