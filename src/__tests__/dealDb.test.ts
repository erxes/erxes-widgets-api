import {
  configFactory,
  dealBoardFactory,
  dealPipelineFactory,
  dealProductFactory,
  dealStageFactory,
  userFactory,
} from '../db/factories';
import { Customers, DealBoards, DealPipelines, DealProducts, Deals, DealStages } from '../db/models';

/**
 * Deals related tests
 */
describe('Deals', () => {
  afterEach(async () => {
    // Clearing test deals
    await DealBoards.deleteMany({});
    await DealPipelines.deleteMany({});
    await DealProducts.deleteMany({});
    await Deals.deleteMany({});
    await DealStages.deleteMany({});
  });

  test('Create Deal:', async () => {
    const board = await dealBoardFactory({ name: 'board' });
    const product = await dealProductFactory({ name: '123' });
    const user = await userFactory({});

    const pipeline = await dealPipelineFactory({
      name: 'pipeline',
      boardId: board._id,
    });

    const stage = await dealStageFactory({
      name: 'stage',
      pipelineId: pipeline._id,
    });

    await configFactory({ code: 'dealUOM', value: ['PCS'] });
    await configFactory({ code: 'dealCurrency', value: ['MNT'] });

    const doc = {
      name: 'testDeal',
      stageName: 'stage',
      boardName: 'board',
      pipelineName: 'pipeline',
      userEmail: user.email,
      customerEmail: 'testCustomer@yahoo.com',
      description: 'description',
      productsData: {
        productName: '123',
        uom: 'PCS',
        currency: 'MNT',
        quantity: 1,
        unitPrice: 123213,
      },
    };

    try {
      doc.boardName = 'dsdewqe';
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe('Board not found');
    }

    doc.boardName = 'board';

    try {
      doc.pipelineName = 'qwerty';
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe('Pipeline not found');
    }

    doc.pipelineName = 'pipeline';

    try {
      doc.stageName = 'qqqq';
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe('Stage not found');
    }

    doc.stageName = 'stage';

    try {
      doc.userEmail = 'qqqq';
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe('User not found');
    }

    doc.userEmail = user.email;

    try {
      doc.productsData.productName = 'qqqq';
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe('Product not found');
    }

    doc.productsData.productName = '123';

    try {
      doc.productsData.uom = 'qqqq';
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe('Bad uom config');
    }

    doc.productsData.uom = 'PCS';

    try {
      doc.productsData.currency = 'qqqq';
      await Deals.createDeal(doc);
    } catch (e) {
      expect(e.message).toBe('Bad currency config');
    }

    doc.productsData.currency = 'MNT';

    const response = await Deals.createDeal(doc);

    const customerObj = await Customers.findOne({
      primaryEmail: 'testCustomer@yahoo.com',
    });

    expect(response.name).toBe(doc.name);
    expect(response.stageId).toBe(stage._id);

    expect(response.customerIds).toEqual(expect.arrayContaining([customerObj._id]));

    expect(response.description).toBe('description');

    const responseProduct = response.productsData[0];

    expect(responseProduct.productId).toBe(product._id);
  });
});
