import { Model, model } from "mongoose";
import { IDeal, dealSchema } from "./definitions/deals";

interface IDealDoc {
  name: string;
  stageId: string;
  assignedUsers?: string[];
  companyIds?: string[];
  cutsomerIds?: string[];
  closeDate?: Date;
  description?: String;
  order?: number;
  productsData?: JSON;
}

interface IDealModel extends Model<IDeal> {
  createDeal(doc: IDealDoc): IDeal;
}

class Deal {
  public static async createDeal(doc: IDealDoc) {
    return Deals.create(doc);
  }
}

dealSchema.loadClass(Deal);

const Deals = model<IDeal, IDealModel>("deals", dealSchema);

export default Deals;
