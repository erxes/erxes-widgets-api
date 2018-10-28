import { Document, Schema } from "mongoose";
import { field } from "../utils";

interface IGoogleCredentials {
  access_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface IMessengerApp {
  kind: "googleMeet" | "knowledgebase" | "lead";
  name: string;

  // can add other credentials link IGoogleCredentials | IMailChimpCredentials
  credentials?: IGoogleCredentials;
}

export interface IMessengerAppDocument extends IMessengerApp, Document {
  _id: string;
}

// Messenger apps ===============
export const messengerAppSchema = new Schema({
  _id: field({ pkey: true }),

  kind: field({
    type: String,
    enum: ["googleMeet", "knowledgebase", "lead"]
  }),

  name: field({ type: String }),
  credentials: field({ type: Object })
});
