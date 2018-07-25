import { Model, model } from "mongoose";
import { UserSchema, IUserDocument } from "./definations/users";

interface IUserModel extends Model<IUserDocument> {}

const Users = model<IUserDocument, IUserModel>("users", UserSchema);

export default Users;
