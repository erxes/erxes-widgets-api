import mongoose from 'mongoose';
import Random from 'meteor-random';
import { mutateAppApi, getLocationInfo } from '../../utils';

const LocationSchema = mongoose.Schema(
  {
    remoteAddress: String,
    country: String,
    city: String,
    region: String,
    hostname: String,
    language: String,
    userAgent: String,
  },
  { _id: false },
);

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
  location: LocationSchema,
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
   * @param  {Object} doc Customer object without computational fields
   * @param  {String} remoteAddress - IP address
   * @param  {Object} browserInfo - {hostname, userAgent, language }
   * @return {Promise} Newly created customer object
   */
  static async createCustomer(doc, remoteAddress, browserInfo) {
    const countryAndCity = await getLocationInfo(remoteAddress);

    const customer = await this.create({
      ...doc,
      createdAt: new Date(),
      location: {
        ...countryAndCity,
        ...browserInfo,
        remoteAddress,
      },
    });

    // call app api's create customer log
    mutateAppApi(`
      mutation {
        activityLogsAddCustomerLog(_id: "${customer._id}") {
          _id
        }
      }`);

    return customer;
  }

  /**
   * Create a new messenger customer
   * @param  {Object} doc - Customer object without computational fields
   * @param  {Object} customData - plan, domain etc ...
   * @param  {String} remoteAddress - IP address
   * @param  {Object} browserInfo - {hostname, userAgent, language }
   * @return {Promise} Newly created customer object
   */
  static async createMessengerCustomer(doc, customData, remoteAddress, browserInfo) {
    doc.messengerData = {
      lastSeenAt: new Date(),
      isActive: true,
      sessionCount: 1,
      customData: customData,
    };

    return this.createCustomer(doc, remoteAddress, browserInfo);
  }

  /**
   * Get or create customer
   * @param  {Object} doc Expected customer object
   * @return {Promise} Existing or newly created customer object
   */
  static async getOrCreateCustomer(doc, remoteAddress, browserInfo) {
    const { integrationId, email } = doc;

    const customer = await this.getCustomer({ integrationId, email });

    if (customer) {
      return customer;
    }

    return this.createCustomer(doc, remoteAddress, browserInfo);
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
