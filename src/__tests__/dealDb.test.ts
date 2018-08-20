import { connect, disconnect } from "../db/connection";
import {
  dealBoardFactory,
  dealFactory,
  dealPipelineFactory,
  dealProductFactory,
  dealStageFactory,
  userFactory
} from "../db/factories";
import {
  DealBoards,
  DealPipelines,
  DealProducts,
  Deals,
  DealStages
} from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Deals related tests
 */
describe("Deals", () => {
  afterEach(async () => {
    // Clearing test deals
    await DealBoards.remove({});
    await DealPipelines.remove({});
    await DealProducts.remove({});
    await Deals.remove({});
    await DealStages.remove({});
  });

  test("Create Deal:", async () => {
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

    const doc = {
      name: "testDeal",
      stageName: "stage",
      boardName: "board",
      pipelineName: "pipeline",
      userEmail: user.email,
      customerIds: ["123312", "21321"],
      description: "description",
      productsData: { productName: "123" }
    };

    try {
      doc.boardName = "dsdewqe";
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe("Board not found");
    }

    doc.boardName = "board";

    try {
      doc.pipelineName = "qwerty";
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe("Pipeline not found");
    }

    doc.pipelineName = "pipeline";

    try {
      doc.stageName = "qqqq";
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe("Stage not found");
    }

    doc.stageName = "stage";

    try {
      doc.userEmail = "qqqq";
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe("User not found");
    }

    doc.userEmail = user.email;

    try {
      doc.productsData.productName = "qqqq";
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe("Product not found");
    }

    doc.productsData.productName = "123";

    const response = await Deals.createDeal(doc);

    expect(response.name).toBe(doc.name);
    expect(response.stageId).toBe(stage._id);

    expect(response.customerIds).toEqual(
      expect.arrayContaining(["123312", "21321"])
    );

    expect(response.description).toBe("description");

    const responseProduct = response.productsData[0];

    expect(responseProduct.productId).toBe(product._id);
  });
});
