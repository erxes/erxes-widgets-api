import { Schema, Model, model } from 'mongoose';
import { BrandSchema, IBrandDocument } from './definations/brands';

interface IBrandModel extends Model<IBrandDocument> {
}

const Brands = model<IBrandDocument, IBrandModel>('brands', BrandSchema);

export default Brands;