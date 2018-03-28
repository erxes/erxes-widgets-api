import { Forms, Fields } from '../../../db/models';

export default {
  form(root, { formId }) {
    return Forms.findOne({ _id: formId }).then(form => ({
      title: form.title,
      buttonText: form.buttonText,
      featuredImage: form.featuredImage,
      themeColor: form.themeColor,
      fields: Fields.find({ contentTypeId: formId }).sort({ order: 1 }),
    }));
  },
};
