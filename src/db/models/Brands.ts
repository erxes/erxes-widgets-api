import { Model, model, Schema } from "mongoose";
import { brandSchema, IBrandDocument } from "./definations/brands";

interface IBrandModel extends Model<IBrandDocument> {}

const Brands = model<IBrandDocument, IBrandModel>("brands", brandSchema);

export default Brands;
