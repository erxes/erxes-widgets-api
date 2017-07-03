import mongoose from 'mongoose';
import Random from 'meteor-random';

const UserSchema = mongoose.Schema({
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
