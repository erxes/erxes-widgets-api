import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IResponseTemplateDocument extends Document {
  _id: string;
  name: string;
  content: string;
  brandId: string;
  files: string[];
}

export const responseTemplateSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  content: field({ type: String }),
  brandId: field({ type: String }),
  files: field({ type: Array })
});
