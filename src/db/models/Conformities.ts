import { Model, model } from 'mongoose';
import { conformitySchema, IConformityDocument } from './definitions/conformities';

interface IConformityModel extends Model<IConformityDocument> {}

export const loadClass = () => {
  class Conformity {}

  conformitySchema.loadClass(Conformity);

  return conformitySchema;
};

loadClass();

// tslint:disable-next-line
export const Conformities = model<IConformityDocument, IConformityModel>('conformities', conformitySchema);
