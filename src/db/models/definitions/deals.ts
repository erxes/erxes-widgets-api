import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { ROLES, PROBABILITY } from "./constants";

interface IcommonFields extends Document {
  userId: string;
  createdAt: Date;
  order: number;
}

interface IBoard extends IcommonFields {
  name: string;
  isDefault: boolean;
}

interface IPipeline extends IcommonFields {
  name: string;
  boardId: string;
}

interface IStage extends IcommonFields {
  name: string;
  probability: string;
  pipeLineId: string;
}

interface IProduct extends IcommonFields {
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
const commonFieldsSchema = {
  userId: field({ type: String }),
  createdAt: field({
    type: Date,
    default: new Date()
  }),
  order: field({ type: Number })
};

const boardSchema = new Schema({
  name: field({ type: String }),
  isDefault: field({
    type: Boolean,
    default: false
  }),
  ...commonFieldsSchema
});

const pipelineSchema = new Schema({
  name: field({ type: String }),
  boardId: field({ type: String }),
  ...commonFieldsSchema
});

const stageSchema = new Schema({
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
