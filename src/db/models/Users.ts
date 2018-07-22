import * as mongoose from 'mongoose';
import * as Random from 'meteor-random';

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  details: {
    avatar: String,
    fullName: String,
  },
});

const Users = mongoose.model('users', UserSchema);

export default Users;
