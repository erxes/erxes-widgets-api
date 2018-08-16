import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { ROLES, PROBABILITY } from "./constants";

interface IcommonFields extends Document {
  userId: string;
  createdAt: Date;
  order: number;
}

export interface IBoard extends IcommonFields {
  name: string;
  isDefault: boolean;
}

export interface IPipeline extends IcommonFields {
  name: string;
  boardId: string;
}

export interface IStage extends IcommonFields {
  name: string;
  probability: string;
  pipeLineId: string;
}

interface IProduct extends Document {
  productId: string;
  uom: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  tax: number;
  discountPercent: number;
  discount: number;
  amount: number;
}

export interface IDeal extends IcommonFields {
  name: string;
  productsData: IProduct[];
  companyIds: string[];
  customerIds: string[];
  closeData: Date;
  description: string;
  assignedUserIds: string[];
  stageId: string;
  modifiedAt: Date;
  modifiedBy: Date;
}

// Mongoose schemas =======================
const commonFieldsSchema = new Schema(
  {
    userId: field({ type: String }),
    createdAt: field({
      type: Date,
      default: new Date()
    }),
    order: field({ type: Number })
  },
  { _id: false }
);

export const boardSchema = new Schema({
  name: field({ type: String }),
  isDefault: field({
    type: Boolean,
    default: false
  }),
  ...commonFieldsSchema
});

export const pipelineSchema = new Schema({
  name: field({ type: String }),
  boardId: field({ type: String }),
  ...commonFieldsSchema
});

export const stageSchema = new Schema({
  name: field({ type: String }),
  probability: field({
    type: String,
    enum: PROBABILITY.ALL
  }), // Win probability
  pipelineId: field({ type: String }),
  ...commonFieldsSchema
});

const productSchema = new Schema(
  {
    _id: String,
    productId: String,
    uom: String, // Units of measurement
    currency: String,
    quantity: Number,
    unitPrice: Number,
    taxPercent: Number,
    tax: Number,
    discountPercent: Number,
    discount: Number,
    amount: Number
  },
  { _id: false }
);

export const dealSchema = new Schema({
  name: field({ type: String }),
  productsData: field({ type: [productSchema] }),
  companyIds: field({ type: [String] }),
  customerIds: field({ type: [String] }),
  closeDate: field({ type: Date }),
  description: field({ type: String, optional: true }),
  assignedUserIds: field({ type: [String] }),
  stageId: field({ type: String }),
  modifiedAt: field({
    type: Date,
    default: new Date()
  }),
  modifiedBy: field({ type: String }),
  ...commonFieldsSchema
});
