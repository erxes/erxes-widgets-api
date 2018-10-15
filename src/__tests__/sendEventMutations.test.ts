import sendEventMutations from "../data/resolvers/mutations/sendEvent";
import { connect, disconnect } from "../db/connection";
import {
  configFactory,
  dealBoardFactory,
  dealPipelineFactory,
  dealProductFactory,
  dealStageFactory,
  userFactory
} from "../db/factories";
import {
  Customers,
  DealBoards,
  DealPipelines,
  DealProducts,
  Deals,
  DealStages
} from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

describe("Deal Mutations: ", () => {
  afterEach(async () => {
    // Clearing test data
    await DealBoards.remove({});
    await DealPipelines.remove({});
    await DealProducts.remove({});
    await Deals.remove({});
    await DealStages.remove({});
  });

  test("Creates new Deal", async () => {
    const board = await dealBoardFactory({ name: "board" });
    const product = await dealProductFactory({ name: "123" });
    const user = await userFactory({});

    const pipeline = await dealPipelineFactory({
      name: "pipeline",
      boardId: board._id
    });

    const stage = await dealStageFactory({
      name: "stage",
      pipelineId: pipeline._id
    });

    await configFactory({ code: "dealUOM", value: ["PCS"] });
    await configFactory({ code: "dealCurrency", value: ["MNT"] });

    const dealDoc = {
      name: "testDeal",
      stageName: "stage",
      userEmail: user.email,
      customerEmail: "testCustomer@yahoo.com",
      description: "description",
      boardName: "board",
      pipelineName: "pipeline",
      productsData: {
        productName: "123",
        uom: "PCS",
        currency: "MNT",
        quantity: 1,
        unitPrice: 123213
      }
    };

    const type = "createDeal";
    const response = await sendEventMutations.sendEvent({}, { type, dealDoc });

    const customerObj = await Customers.findOne({
      primaryEmail: "testCustomer@yahoo.com"
    });

    expect(response.name).toBe(dealDoc.name);
    expect(response.stageId).toBe(stage._id);

    expect(response.customerIds).toEqual(
      expect.arrayContaining([customerObj._id])
    );

    expect(response.description).toBe("description");
    const responseProduct = response.productsData[0];
    expect(responseProduct.productId).toBe(product._id);
  });
});
