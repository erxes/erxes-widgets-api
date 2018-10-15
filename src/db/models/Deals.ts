import { Model, model } from "mongoose";
import { Configs, Users } from "./";
import { Customers } from "./";
import {
  boardSchema,
  dealSchema,
  IBoardDocument,
  IDealDocument,
  IPipelineDocument,
  IProductDocument,
  IStageDocument,
  pipelineSchema,
  productSchema,
  stageSchema
} from "./definitions/deals";

interface IProductDataInput {
  productName: string;
  uom: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  taxPercent?: number;
  tax?: number;
  discountPercent?: number;
  discount?: number;
  amount?: number;
}

export interface IDealInput {
  name: string;
  boardName: string;
  pipelineName: string;
  stageName: string;
  userEmail: string;
  companyIds?: string[];
  customerEmail?: string;
  description?: string;
  productsData: IProductDataInput;
}

interface IStageModel extends Model<IStageDocument> {}

interface IProductModel extends Model<IProductDocument> {}

interface IBoardModel extends Model<IBoardDocument> {}

interface IPipelineModel extends Model<IPipelineDocument> {}

interface IDealModel extends Model<IDealDocument> {
  createDeal(doc: IDealInput): IDealDocument;
}

class Deal {
  public static async createDeal(doc: IDealInput) {
    const {
      stageName,
      userEmail,
      productsData,
      boardName,
      pipelineName,
      customerEmail
    } = doc;

    const { productName, uom, currency } = productsData;

    const user = await Users.findOne({ email: userEmail });

    if (!user) {
      throw new Error("User not found");
    }

    const board = await DealBoards.findOne({ name: boardName });

    if (!board) {
      throw new Error("Board not found");
    }

    const pipeline = await DealPipelines.findOne({
      boardId: board._id,
      name: pipelineName
    });

    if (!pipeline) {
      throw new Error("Pipeline not found");
    }

    const stage = await DealStages.findOne({
      name: stageName,
      pipelineId: pipeline._id
    });

    if (!stage) {
      throw new Error("Stage not found");
    }

    const product = await DealProducts.findOne({ name: productName });

    if (!product) {
      throw new Error("Product not found");
    }

    const uomConfig = await Configs.findOne({ code: "dealUOM" });

    if (!uomConfig.value.includes(uom)) {
      throw new Error("Bad uom config");
    }

    const currencyConfig = await Configs.findOne({ code: "dealCurrency" });

    if (!currencyConfig.value.includes(currency)) {
      throw new Error("Bad currency config");
    }

    const customerIds = [];

    if (customerEmail) {
      const email = customerEmail;

      const customerObj = await Customers.getOrCreateCustomer(
        { email },
        { email, integrationId: "" }
      );

      customerIds.push(customerObj._id);
    }

    delete doc.stageName;
    delete doc.userEmail;
    delete productsData.productName;

    return Deals.create({
      ...doc,
      stageId: stage._id,
      userId: user._id,
      customerIds,
      productsData: {
        ...productsData,
        productId: product._id
      }
    });
  }
}

dealSchema.loadClass(Deal);

const Deals = model<IDealDocument, IDealModel>("deals", dealSchema);

const DealStages = model<IStageDocument, IStageModel>(
  "deal_stages",
  stageSchema
);

const DealBoards = model<IBoardDocument, IBoardModel>(
  "deal_boards",
  boardSchema
);

const DealPipelines = model<IPipelineDocument, IPipelineModel>(
  "deal_pipelines",
  pipelineSchema
);

const DealProducts = model<IProductDocument, IProductModel>(
  "products",
  productSchema
);

export { Deals, DealStages, DealProducts, DealBoards, DealPipelines };
