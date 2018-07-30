import { Model, model } from "mongoose";
import { IUserDocument, userSchema } from "./definations/users";

interface IUserModel extends Model<IUserDocument> {}

const Users = model<IUserDocument, IUserModel>("users", userSchema);

export default Users;
