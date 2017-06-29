import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  _id: String,
  details: {
    avatar: String,
    fullName: String,
  },
});

const Users = mongoose.model('users', UserSchema);

export default Users;
