import sendEventMutations from "../data/resolvers/mutations/sendEvent";
import { connect, disconnect } from "../db/connection";
import { userFactory } from "../db/factories";
import { DealProducts, Deals, DealStages } from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

describe("Deal Mutations: ", () => {
  afterEach(async () => {
    // Clearing test data
    await Deals.remove({});
    await DealStages.remove({});
  });

  test("Creates new Deal", async () => {
    const stage = await DealStages.create({ name: "stageName" });
    const product = await DealProducts.create({ name: "123" });
    const user = await userFactory({});

    const doc = {
      name: "testDeal",
      stageName: "stageName",
      userEmail: user.email,
      customerIds: ["123312", "21321"],
      description: "description",
      productsData: { productName: "123", uom: "1231" }
    };

    const type = "createDeal";

    const response = await sendEventMutations.sendEvent({}, { type, doc });

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
