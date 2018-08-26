import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IEmailTemplateDocument extends Document {
  _id: string;
  name: string;
  content: string;
}

export const emailTemplateSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  content: field({ type: String })
});
