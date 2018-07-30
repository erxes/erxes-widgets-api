import { model, Model } from "mongoose";
import { fieldSchema, IFieldDocument } from "./definations/fields";

interface IFieldModel extends Model<IFieldDocument> {}

const Fields = model<IFieldDocument, IFieldModel>("fields", fieldSchema);

export default Fields;
