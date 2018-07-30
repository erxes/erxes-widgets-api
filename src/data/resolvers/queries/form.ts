import { Forms } from "../../../db/models";

export default {
  form(root: any, { formId }: { formId: string }) {
    return Forms.findOne({ _id: formId });
  }
};
