import { Forms } from '../../../db/models';

export default {
  form(root, { formId }) {
    return Forms.findOne({ _id: formId });
  },
};
