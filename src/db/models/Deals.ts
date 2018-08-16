import { Model, model } from "mongoose";
import {
  boardSchema,
  IBoard,
  pipelineSchema,
  stageSchema,
  IPipeline,
  IStage,
  IDeal,
  dealSchema
} from "./definitions/deals";

interface IDealDoc {
  _id?: string;
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

interface IOrderDoc {
  _id: string;
  order: number;
}

interface IDealModel extends Model<IDeal> {
  createDeal(doc: IDealDoc): IDeal;
  updateDeal(doc: IDealDoc): IDeal;
  updateOrder(doc: IOrderDoc): IDeal[];
  removeDeal(doc: IDealDoc): string;
}

class Deal {
  public static async createDeal(doc: IDealDoc) {
    return Deals.create(doc);
  }
}

dealSchema.loadClass(Deal);

const Deals = model<IDeal, IDealModel>("deals", dealSchema);

export default Deals;
