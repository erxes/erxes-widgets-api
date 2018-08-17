import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { PROBABILITY, ROLES } from "./constants";

interface ICommonFields extends Document {
  userId: string;
  createdAt: Date;
  order: number;
}

interface IBoard extends ICommonFields {
  name: string;
  isDefault: boolean;
}

interface IPipeline extends ICommonFields {
  name: string;
  boardId: string;
}

export interface IStage extends ICommonFields {
  name: string;
  probability: string;
  pipeLineId: string;
}

export interface IProduct extends Document {
  productId?: string;
  uom?: string;
  currency?: string;
  quantity?: number;
  unitPrice?: number;
  taxPercent?: number;
  tax?: number;
  discountPercent?: number;
  discount?: number;
  amount?: number;
}

export interface IDeal extends ICommonFields {
  name: string;
  productsData: IProduct[];
  companyIds: string[];
  customerIds: string[];
  closeDate: Date;
  description: string;
  assignedUserIds: string[];
  stageId: string;
  modifiedAt: Date;
  modifiedBy: Date;
}

// Mongoose schemas =======================
const commonFieldsSchema = {
  userId: field({ type: String }),
  createdAt: field({
    type: Date,
    default: new Date()
  }),
  order: field({ type: Number })
};

const boardSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  isDefault: field({
    type: Boolean,
    default: false
  }),
  ...commonFieldsSchema
});

const pipelineSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  boardId: field({ type: String }),
  ...commonFieldsSchema
});

export const stageSchema = new Schema({
  _id: field({ pkey: true }),
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
    _id: field({ type: String }),
    productId: field({ type: String }),
    uom: field({ type: String }), // Units of measurement
    currency: field({ type: String }),
    quantity: field({ type: Number }),
    unitPrice: field({ type: Number }),
    taxPercent: field({ type: Number }),
    tax: field({ type: Number }),
    discountPercent: field({ type: Number }),
    discount: field({ type: Number }),
    amount: field({ type: Number })
  },
  { _id: false }
);

export const dealSchema = new Schema({
  _id: field({ pkey: true }),
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
