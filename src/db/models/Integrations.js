import mongoose from 'mongoose';
import Random from 'meteor-random';
import Brands from './Brands';

const IntegrationSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  brandId: String,
  formId: String,
  kind: String,
  formData: Object,
  messengerData: Object,
  uiOptions: Object,
});

class Integration {
  /**
   * Get integration
   * @param  {String} brandCode
   * @param  {String} kind
   * @return {Promise} Existing integration object
   */
  static getIntegration(brandCode, kind) {
    return Brands.findOne({ code: brandCode }).then(brand =>
      this.findOne({
        brandId: brand._id,
        kind,
      }),
    );
  }
}

IntegrationSchema.loadClass(Integration);

const Integrations = mongoose.model('integrations', IntegrationSchema);

export default Integrations;
