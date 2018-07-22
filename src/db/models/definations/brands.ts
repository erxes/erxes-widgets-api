import * as Random from 'meteor-random';

export const schemaOptions = {
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  code: String,
};
