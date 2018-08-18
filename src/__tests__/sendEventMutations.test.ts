import sendEventMutations from "../data/resolvers/mutations/sendEvent";
import { connect, disconnect } from "../db/connection";
import { Deals, DealStages } from "../db/models";

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

    const doc = {
      name: "testDeal",
      stageName: "stageName",
      customerIds: ["123312", "21321"],
      description: "description",
      productsData: { productId: "123" }
    };

    const type = "createDeal";

    const response = await sendEventMutations.sendEvent({}, { type, doc });

    expect(response.name).toBe(doc.name);
    expect(response.stageId).toBe(stage._id);

    expect(response.customerIds).toEqual(
      expect.arrayContaining(["123312", "21321"])
    );

    expect(response.description).toBe("description");

    expect(response.productsData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          // 3
          productId: "123" // 4
        })
      ])
    );
  });
});
