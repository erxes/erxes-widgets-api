import { model, Model } from "mongoose";
import { FieldSchema, IFieldDocument } from "./definations/fields";

interface IFieldModel extends Model<IFieldDocument> {}

const Fields = model<IFieldDocument, IFieldModel>("fields", FieldSchema);

export default Fields;
