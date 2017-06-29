import mongoose from 'mongoose';
import Random from 'meteor-random';

const CustomerSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  integrationId: String,
  email: String,
  isUser: Boolean,
  name: String,
  createdAt: Date,
  messengerData: Object,
});

const Customers = mongoose.model('customers', CustomerSchema);

export default Customers;
