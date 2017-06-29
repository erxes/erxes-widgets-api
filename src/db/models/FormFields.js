import mongoose from 'mongoose';
import Random from 'meteor-random';

const FormFieldSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  formId: String,
  type: String,
  validation: String,
  check: String,
  text: String,
  description: String,
  options: [String],
  isRequired: Boolean,
  order: Number,
});

const FormFields = mongoose.model('form_fields', FormFieldSchema);

export default FormFields;
