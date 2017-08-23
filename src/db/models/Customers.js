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

class Customer {
  /**
   * Get customer
   * @param  {String} integrationId
   * @param  {String} email
   * @return {Promise} Existing customer object
   */
  static getCustomer({ integrationId, email, cachedCustomerId }) {
    if (email) {
      return Customers.findOne({ email, integrationId });
    }

    if (cachedCustomerId) {
      return Customers.findOne({ _id: cachedCustomerId });
    }

    return Promise.resolve(null);
  }

  /**
   * Create a new customer
   * @param  {Object} customerObj Customer object without computational fields
   * @return {Promise} Newly created customer object
   */
  static createCustomer(customerObj, messengerCustomData) {
    const now = new Date();
    return this.create({
      ...customerObj,
      createdAt: now,
      messengerData: {
        lastSeenAt: now,
        isActive: true,
        sessionCount: 1,
        customData: messengerCustomData,
      },
    });
  }

  /**
   * Get or create customer
   * @param  {Object} customerObj Expected customer object
   * @return {Promise} Existing or newly created customer object
   */
  static getOrCreateCustomer(customerObj) {
    const { integrationId, email } = customerObj;

    return this.getCustomer({ integrationId, email }).then(customer => {
      if (customer) {
        return Promise.resolve(customer);
      }

      return this.createCustomer(customerObj);
    });
  }

  /**
   * Mark customer as inactive
   * @param  {String} customerId
   * @return {Promise} Updated customer
   */
  static markCustomerAsNotActive(customerId) {
    return this.findByIdAndUpdate(
      customerId,
      {
        $set: {
          'messengerData.isActive': false,
          'messengerData.lastSeenAt': new Date(),
        },
      },
      { new: true },
    );
  }
}

CustomerSchema.loadClass(Customer);

const Customers = mongoose.model('customers', CustomerSchema);

export default Customers;
