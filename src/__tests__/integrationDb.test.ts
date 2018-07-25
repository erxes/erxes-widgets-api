import { connect, disconnect } from "../db/connection";
import { brandFactory, integrationFactory } from "../db/factories";
import {
  Integrations,
  Customers,
  IBrandDocument,
  IIntegrationDocument
} from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

describe("Integrations", () => {
  let _brand: IBrandDocument;
  let _integration: IIntegrationDocument;

  beforeEach(async () => {
    // Creating test brand and integration
    _brand = await brandFactory();
    _integration = await integrationFactory({
      brandId: _brand._id,
      kind: "messenger"
    });
  });

  afterEach(() => {
    // Clearing test data
    return Customers.remove({});
  });

  test("getIntegration() must return an integration", async () => {
    const integration = await Integrations.getIntegration(
      _brand.code,
      _integration.kind
    );
    expect(integration).toBeDefined();
    expect(integration.kind).toBe(_integration.kind);
  });
});
