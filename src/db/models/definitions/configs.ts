import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IConfigDocument extends Document {
  _id: string;
  code: string;
  value: string[];
}

// Mongoose schemas ===========

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String }),
  value: field({ type: [String] })
});
