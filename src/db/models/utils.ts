const Random: any = require('meteor-random');

/*
 * Mongoose field options wrapper
 */
export const field = (options: any) => {
  // TODO: resolve _id field
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  if (pkey) {
    options.type = String;
    options.unique = true;
    options.default = () => Random.id();
  }

  return options;
};
