/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import Random from 'meteor-random';
import { connect, disconnect } from '../db/connection';
import { Customers, Integrations, Brands } from '../db/models';
import { integrationFactory, customerFactory } from '../db/factories';
import commonMutations from '../data/resolvers/mutations/common';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Common mutation test', () => {
  afterEach(async () => {
    // Clearing test data
    await Brands.remove({});
    await Integrations.remove({});
    await Customers.remove({});
  });

  test('Save browser info', async () => {
    const integration = await integrationFactory({
      brandId: Random.id(),
      kind: 'messenger',
    });

    const customer = await customerFactory({
      integrationId: integration._id,
    });

    const browserInfo = {
      hostname: 'localhost.com',
      language: 'en',
      userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5)
        AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36`,
    };

    const response = await commonMutations.saveBrowserInfo(
      {},
      { customerId: customer._id, browserInfo },
    );

    expect(response.location.hostname).toBe(browserInfo.hostname);
    expect(response.location.language).toBe(browserInfo.language);
    expect(response.location.userAgent).toBe(browserInfo.userAgent);
  });
});
