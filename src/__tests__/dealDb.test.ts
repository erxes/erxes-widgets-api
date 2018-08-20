import { connect, disconnect } from "../db/connection";
import { userFactory } from "../db/factories";
import { DealProducts, Deals, DealStages } from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Deals related tests
 */
describe("Deals", () => {
  afterEach(async () => {
    // Clearing test deals
    await Deals.remove({});
    await DealStages.remove({});
  });

  test("Create Deal:", async () => {
    const stage = await DealStages.create({ name: "stageName" });
    const product = await DealProducts.create({ name: "123" });
    const user = await userFactory({});

    const doc = {
      name: "testDeal",
      stageName: "stageName",
      userEmail: user.email,
      customerIds: ["123312", "21321"],
      description: "description",
      productsData: { productName: "123" }
    };

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
