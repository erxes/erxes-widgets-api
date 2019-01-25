import { Model, model } from 'mongoose';
import { IUserDocument, userSchema } from './definitions/users';

interface IUserModel extends Model<IUserDocument> {}

// tslint:disable-next-line
const Users = model<IUserDocument, IUserModel>('users', userSchema);

export default Users;
