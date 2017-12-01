import { Forms, Fields } from '../../../db/models';

export default {
  form(root, { formId }) {
    return Forms.findOne({ _id: formId }).then(form => ({
      title: form.title,
      fields: Fields.find({ contentTypeId: formId }).sort({ order: 1 }),
    }));
  },
};
