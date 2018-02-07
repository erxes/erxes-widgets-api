import mongoose from 'mongoose';
import Random from 'meteor-random';
import { mutateAppApi } from '../../utils';

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

const VisitorContactSchema = mongoose.Schema(
  {
    email: String,
    phone: String,
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
  messengerData: Object,
  companyIds: [String],

  location: LocationSchema,

  // if customer is not a user then we will contact with this visitor using
  // this information
  visitorContactInfo: VisitorContactSchema,
});

class Customer {
  /**
   * Get customer
   * @param  {String} integrationId
   * @param  {String} email
   * @return {Promise} Existing customer object
   */
  static getCustomer({ email, phone, cachedCustomerId }) {
    if (email) {
      return this.findOne({ email });
    }

    if (phone) {
      return this.findOne({ phone });
    }

    if (cachedCustomerId) {
      return this.findOne({ _id: cachedCustomerId });
    }

    return null;
  }

  /**
   * Create a new customer
   * @param  {Object} doc Customer object without computational fields
   * @param  {Object} browserInfo - {hostname, userAgent, language }
   * @return {Promise} Newly created customer object
   */
  static async createCustomer(doc, browserInfo) {
    const customer = await this.create({
      ...doc,
      createdAt: new Date(),
      location: browserInfo,
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
   * @param  {Object} browserInfo - {hostname, userAgent, language }
   * @return {Promise} Newly created customer object
   */
  static async createMessengerCustomer(doc, customData, browserInfo) {
    doc.messengerData = {
      lastSeenAt: new Date(),
      isActive: true,
      sessionCount: 1,
      customData: customData,
    };

    return this.createCustomer(doc, browserInfo);
  }

  /**
   * Update messenger customer data
   * @param  {Object} _id - Customer id
   * @param  {Object} doc - Customer object without computational fields
   * @param  {Object} customData - plan, domain etc ...
   * @param  {Object} browserInfo - {hostname, userAgent, language }
   * @return {Promise} - updated customer
   */
  static async updateMessengerCustomer(_id, doc, customData, browserInfo) {
    doc['messengerData.customData'] = customData;
    doc.location = browserInfo;

    await this.findByIdAndUpdate(_id, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Get or create customer
   * @param  {Object} doc Expected customer object
   * @return {Promise} Existing or newly created customer object
   */
  static async getOrCreateCustomer(doc, browserInfo) {
    const customer = await this.getCustomer(doc);

    if (customer) {
      return customer;
    }

    return this.createCustomer(doc, browserInfo);
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
   * Update messenger session data
   * @param {String} customer id
   * @return {Promise} updated customer
   */
  static async updateMessengerSession(_id) {
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

  /*
   * If customer is a visitor then we will contact with this customer using
   * this information later
   */
  static async saveVisitorContactInfo({ customerId, type, value }) {
    if (type === 'email') {
      await this.update({ _id: customerId }, { 'visitorContactInfo.email': value });
    }

    if (type === 'phone') {
      await this.update({ _id: customerId }, { 'visitorContactInfo.phone': value });
    }

    return this.findOne({ _id: customerId });
  }
}

CustomerSchema.loadClass(Customer);

const Customers = mongoose.model('customers', CustomerSchema);

export default Customers;
