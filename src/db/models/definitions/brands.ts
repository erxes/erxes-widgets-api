import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IBrandEmailConfig extends Document {
  type: string;
  template: string;
}

export interface IBrandDocument extends Document {
  _id: string;
  code: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  emailConfig: IBrandEmailConfig;
}

// Mongoose schemas ===========
const brandEmailConfigSchema = new Schema({
  type: field({
    type: String,
    enum: ["simple", "custom"]
  }),
  template: field({ type: String })
});

export const brandSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String }),
  name: field({ type: String }),
  description: field({ type: String }),
  userId: field({ type: String }),
  createdAt: field({ type: Date }),
  emailConfig: field({ type: brandEmailConfigSchema })
});
