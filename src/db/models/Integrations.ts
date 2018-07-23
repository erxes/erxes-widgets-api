import { Document, Model, model } from 'mongoose';
import * as Random from 'meteor-random';
import { IntegrationSchema, IIntegrationDocument } from './definations/integrations';
import Brands from './Brands';

interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(
    brandCode: string,
    kind: string,
    brandObject?: boolean
  ): IIntegrationDocument
}

class Integration {
  /**
   * Get integration
   * @param  {String} brandCode
   * @param  {String} kind
   * @param  {Boolean} brandObject: Determines to include brand object
   * @return {Promise} Existing integration object
   */
  static async getIntegration(brandCode, kind, brandObject = false) {
    const brand = await Brands.findOne({ code: brandCode });

    if (!brand) {
      throw new Error('Brand not found');
    }

    const integration = await Integrations.findOne({ brandId: brand._id, kind });

    if (brandObject) {
      return {
        integration,
        brand,
      };
    }

    return integration;
  }
}

IntegrationSchema.loadClass(Integration);

const Integrations = model<IIntegrationDocument, IIntegrationModel>(
  'integrations',
  IntegrationSchema
);

export default Integrations;
