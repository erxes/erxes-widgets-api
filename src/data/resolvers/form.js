import { Fields } from '../../db/models';

export default {
  fields(form) {
    return Fields.find({ contentType: 'form', contentTypeId: form._id }).sort({ order: 1 });
  },
};
