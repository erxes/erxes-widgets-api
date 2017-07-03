import mongoose from 'mongoose';
import Random from 'meteor-random';

const BrandSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  code: String,
});

const Brands = mongoose.model('brands', BrandSchema);

export default Brands;
