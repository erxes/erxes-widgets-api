import { Model, model, Schema } from "mongoose";
import { brandSchema, IBrandDocument } from "./definitions/brands";

interface IBrandModel extends Model<IBrandDocument> {}

const Brands = model<IBrandDocument, IBrandModel>("brands", brandSchema);

export default Brands;
