import { Model, model } from "mongoose";
import {
  engageMessageSchema,
  IEngageMessageDocument
} from "./definitions/engages";

interface IEngageMessageModel extends Model<IEngageMessageDocument> {}

class EngageMessage {}

engageMessageSchema.loadClass(EngageMessage);

export const EngageMessages = model<
  IEngageMessageDocument,
  IEngageMessageModel
>("engage_messages", engageMessageSchema);
