import { Model, model } from 'mongoose';
import { IUserDocument, userSchema } from './definitions/users';

export interface IUserModel extends Model<IUserDocument> {}

export const loadClass = () => {
  return userSchema;
};

// tslint:disable-next-line
const Users = model<IUserDocument, IUserModel>('users', userSchema);

export default Users;
