import * as Random from "meteor-random";

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
    options.default = () => Random.id();
  }

  return options;
};
