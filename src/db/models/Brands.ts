import { Model, model } from 'mongoose';
import { brandSchema, IBrandDocument } from './definitions/brands';

interface IBrandModel extends Model<IBrandDocument> {}

// tslint:disable-next-line
const Brands = model<IBrandDocument, IBrandModel>('brands', brandSchema);

export default Brands;
