import customerMutations from "../data/resolvers/mutations/customer";
import { customerFactory } from "../db/factories";
import { Customers } from "../db/models";

describe("Customer mutations: ", () => {
  afterEach(async () => {
    // Clearing test data
    await Customers.deleteMany({});
  });

  test("Update customer email", async () => {
    const customer = await customerFactory({});

    const response = await customerMutations.updateCustomer(
      {},
      { _id: customer._id, email: "newEmail@yahoo.com" }
    );

    expect(response.emails).toContain("newEmail@yahoo.com");
  });
});
