import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { TAG_TYPES } from "./constants";

export interface ITagDocument extends Document {
  _id: string;
  name: string;
  type: string;
  colorCode: string;
  createdAt: Date;
  objectCount: number;
}

export const tagSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  type: field({
    type: String,
    enum: TAG_TYPES.ALL
  }),
  colorCode: field({ type: String }),
  createdAt: field({ type: Date }),
  objectCount: field({ type: Number })
});
