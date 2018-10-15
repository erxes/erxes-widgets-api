import { IFieldDocument } from "../../db/models";

export default {
  name(field: IFieldDocument) {
    return `erxes-form-field-${field._id}`;
  }
};
