import { connect, disconnect } from "../db/connection";
import { companyFactory } from "../db/factories";
import { Companies } from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Company related tests
 */
describe("Companies", () => {
  afterEach(() => {
    // Clearing test companies
    return Companies.remove({});
  });

  test("createCompany", async () => {
    const company = await Companies.createCompany({ name: "test" });

    expect(company).toBeDefined();
    expect(company.createdAt).toBeDefined();
    expect(company.modifiedAt).toBeDefined();
    expect(company.primaryName).toBe("test");
    expect(company.names).toContain("test");
  });

  test("getOrCreate()", async () => {
    // check names
    let company = await companyFactory({
      names: ["911111"]
    });

    company = await Companies.getOrCreate({
      name: "911111"
    });

    expect(company._id).toBeDefined();
    expect(company.names).toContain("911111");

    // check primaryName
    company = await companyFactory({
      primaryName: "24244242"
    });

    company = await Companies.getOrCreate({
      name: "24244242"
    });

    expect(company._id).toBeDefined();
    expect(company.primaryName).toBe("24244242");
  });
});
