import { Schema, model } from 'mongoose';
import * as Random from 'meteor-random';
import { schemaOptions } from './definations/brands';

const BrandSchema = new Schema(schemaOptions);

const Brands = model('brands', BrandSchema);

export default Brands;
