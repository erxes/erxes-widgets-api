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
      leadData: {
        viewCount: 0,
        contactsGathered: 0,
      },
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('getIntegration() must return an integration', async () => {
    const integration = await Integrations.getIntegration(_brand.code, _integration.kind);
    expect(integration).toBeDefined();
    expect(integration.kind).toBe(_integration.kind);
  });

  test('Increase view count of form', async () => {
    let updated = await Integrations.increaseViewCount(_integration.formId);
    expect(updated.leadData.viewCount).toBe(1);

    updated = await Integrations.increaseViewCount(_integration.formId);
    expect(updated.leadData.viewCount).toBe(2);
  });

  test('Increase contacts gathered', async () => {
    let updated = await Integrations.increaseContactsGathered(_integration.formId);

    expect(updated.leadData.contactsGathered).toBe(1);

    updated = await Integrations.increaseContactsGathered(_integration.formId);
    expect(updated.leadData.contactsGathered).toBe(2);
  });
});
