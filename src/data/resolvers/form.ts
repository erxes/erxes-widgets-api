import { Fields, IFormDocument } from "../../db/models";

export default {
  fields(form: IFormDocument) {
    return Fields.find({ contentType: "form", contentTypeId: form._id }).sort({
      order: 1
    });
  }
};
