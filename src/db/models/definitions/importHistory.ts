import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IImportHistoryDocument extends Document {
  _id: string;
  success: number;
  failed: number;
  total: number;
  ids: string[];
  contentType: string;
  userId: string;
  date: Date;
}

export const importHistorySchema = new Schema({
  _id: field({ pkey: true }),
  success: field({ type: Number }),
  failed: field({ type: Number }),
  total: field({ type: Number }),
  ids: field({ type: [String] }),
  contentType: field({ type: String }),
  userId: field({ type: String }),
  date: field({ type: Date })
});
