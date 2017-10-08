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
  phone: String,
  isUser: Boolean,
  name: String,
  createdAt: Date,
  messengerData: Object,
  companyIds: [String],
});

class Customer {
  /**
   * Get customer
   * @param  {String} integrationId
   * @param  {String} email
   * @return {Promise} Existing customer object
   */
  static getCustomer({ integrationId, email, phone, cachedCustomerId }) {
    if (email) {
      return Customers.findOne({ email, integrationId });
    }

    if (phone) {
      return Customers.findOne({ phone, integrationId });
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
  static async getOrCreateCustomer(customerObj) {
    const { integrationId, email } = customerObj;

    const customer = await this.getCustomer({ integrationId, email });

    if (customer) {
      return customer;
    }

    return this.createCustomer(customerObj);
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

  /*
   * Update messenger data
   * @param {String} customer id
   * @return {Promise} updated customer
   */
  static async updateMessengerData(_id) {
    const now = new Date();
    const customer = await this.findOne({ _id });

    // update messengerData
    const query = {
      $set: {
        'messengerData.lastSeenAt': now,
        'messengerData.isActive': true,
      },
    };

    if (now - customer.messengerData.lastSeenAt > 30 * 60 * 1000) {
      // update session count
      query.$inc = { 'messengerData.sessionCount': 1 };
    }

    // update
    await this.findByIdAndUpdate(_id, query);

    // updated customer
    return this.findOne({ _id });
  }

  /*
   * Add companyId to companyIds list
   * @param {String} _id customer id
   * @param {String} companyId
   * @return {Promise}
   */
  static async addCompany(_id, companyId) {
    await this.findByIdAndUpdate(_id, { $addToSet: { companyIds: companyId } });

    // updated customer
    return this.findOne({ _id });
  }
}

CustomerSchema.loadClass(Customer);

const Customers = mongoose.model('customers', CustomerSchema);

export default Customers;
