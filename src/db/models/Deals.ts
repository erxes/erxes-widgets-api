import { Model, model } from "mongoose";
import { dealSchema, IDeal, IStage, stageSchema } from "./definitions/deals";

interface IProductDataInput {
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

export interface IDealInput {
  name: string;
  stageName: string;
  companyIds?: string[];
  customerIds?: string[];
  description?: string;
  productsData?: IProductDataInput;
}

interface IStageModel extends Model<IStage> {}

interface IDealModel extends Model<IDeal> {
  createDeal(doc: IDealInput): IDeal;
}

class Deal {
  public static async createDeal(doc: IDealInput) {
    const { stageName } = doc;

    const stage = await DealStages.findOne({ name: stageName });

    if (!stage) {
      throw new Error("Stage not found");
    }

    delete doc.stageName;

    return Deals.create({ ...doc, stageId: stage._id });
  }
}

dealSchema.loadClass(Deal);

const Deals = model<IDeal, IDealModel>("deals", dealSchema);

const DealStages = model<IStage, IStageModel>("deal_stages", stageSchema);

export { Deals, DealStages };
