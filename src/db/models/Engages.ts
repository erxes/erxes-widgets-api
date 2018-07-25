import { Model, model } from "mongoose";
import {
  IEngageMessageDocument,
  EngageMessageSchema
} from "./definations/engages";

interface IEngageMessageModel extends Model<IEngageMessageDocument> {}

class EngageMessage {}

EngageMessageSchema.loadClass(EngageMessage);

export const EngageMessages = model<
  IEngageMessageDocument,
  IEngageMessageModel
>("engage_messages", EngageMessageSchema);
