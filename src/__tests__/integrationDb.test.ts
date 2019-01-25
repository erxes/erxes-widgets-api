import { brandFactory, integrationFactory } from '../db/factories';
import { Customers, IBrandDocument, IIntegrationDocument, Integrations } from '../db/models';

describe('Integrations', () => {
  let _brand: IBrandDocument;
  let _integration: IIntegrationDocument;

  beforeEach(async () => {
    // Creating test brand and integration
    _brand = await brandFactory();
    _integration = await integrationFactory({
      brandId: _brand._id,
      kind: 'messenger',
    });
  });

  afterEach(() => {
    // Clearing test data
    return Customers.deleteMany({});
  });

  test('getIntegration() must return an integration', async () => {
    const integration = await Integrations.getIntegration(_brand.code, _integration.kind);
    expect(integration).toBeDefined();
    expect(integration.kind).toBe(_integration.kind);
  });
});
