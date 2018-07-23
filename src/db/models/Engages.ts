import { Model, model } from 'mongoose';
import * as Random from 'meteor-random';
import { IEngageMessageDocument, EngageMessageSchema } from './definations/engages';

interface IEngageMessageModel extends Model<IEngageMessageDocument> {
}

class EngageMessage {}

EngageMessageSchema.loadClass(EngageMessage);

export const EngageMessages = model<IEngageMessageDocument, IEngageMessageModel>(
  'engage_messages', EngageMessageSchema
);
