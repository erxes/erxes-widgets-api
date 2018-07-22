import { Schema, model } from 'mongoose';
import * as Random from 'meteor-random';

const BrandSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  code: String,
});

const Brands = model('brands', BrandSchema);

export default Brands;
