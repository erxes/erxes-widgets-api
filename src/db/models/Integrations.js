import mongoose from 'mongoose';
import Random from 'meteor-random';

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

const Integrations = mongoose.model('integrations', IntegrationSchema);

export default Integrations;
