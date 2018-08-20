import { Model, model } from "mongoose";
import { Users } from "./";
import {
  dealSchema,
  IDeal,
  IProduct,
  IStage,
  productSchema,
  stageSchema
} from "./definitions/deals";

interface IProductDataInput {
  productName: string;
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

export interface IDealInput {
  name: string;
  stageName: string;
  userEmail: string;
  companyIds?: string[];
  customerIds?: string[];
  description?: string;
  productsData?: IProductDataInput;
}

interface IStageModel extends Model<IStage> {}

interface IProductModel extends Model<IProduct> {}

interface IDealModel extends Model<IDeal> {
  createDeal(doc: IDealInput): IDeal;
}

class Deal {
  public static async createDeal(doc: IDealInput) {
    const { stageName, userEmail, productsData } = doc;
    const { productName } = productsData;

    const user = await Users.findOne({ email: userEmail });

    if (!user) {
      throw new Error("User not found");
    }

    const stage = await DealStages.findOne({ name: stageName });

    if (!stage) {
      throw new Error("Stage not found");
    }

    const product = await DealProducts.findOne({ name: productName });

    if (!product) {
      throw new Error("Product not found");
    }

    delete doc.stageName;
    delete doc.userEmail;
    delete productsData.productName;

    return Deals.create({
      ...doc,
      stageId: stage._id,
      userId: user._id,
      productsData: {
        ...productsData,
        productId: product._id
      }
    });
  }
}

dealSchema.loadClass(Deal);

const Deals = model<IDeal, IDealModel>("deals", dealSchema);

const DealStages = model<IStage, IStageModel>("deal_stages", stageSchema);

const DealProducts = model<IProduct, IProductModel>("products", productSchema);

export { Deals, DealStages, DealProducts };
