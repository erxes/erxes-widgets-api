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

  primaryPhone: String,
  phones: [String],

  primaryEmail: String,
  emails: [String],

  isUser: Boolean,
  firstName: String,
  lastName: String,
  createdAt: Date,
  lastSeenAt: Date,
  messengerData: Object,
  companyIds: [String],
  description: String,

  location: LocationSchema,

  // if customer is not a user then we will contact with this visitor using
  // this information
  visitorContactInfo: VisitorContactSchema,

  urlVisits: Object,
});

class Customer {
  /**
   * Get customer
   * @param  {Object} customData - Customer customData from widget
   * @param  {Object} doc - Customer basic info fields
   * @return {Promise} Updated customer fields
   */
  static assignFields(customData, doc) {
    // Setting customData fields to customer fields
    Object.keys(customData).forEach(key => {
      if (key === 'first_name' || key === 'firstName') {
        doc.firstName = customData[key];

        delete customData[key];
      }

      if (key === 'last_name' || key === 'lastName') {
        doc.lastName = customData[key];

        delete customData[key];
      }

      if (key === 'bio' || key === 'description') {
        doc.description = customData[key];

        delete customData[key];
      }
    });

    return doc;
  }

  /**
   * Get customer
   * @param  {String} integrationId
   * @param  {String} email
   * @return {Promise} Existing customer object
   */
  static getCustomer({ email, phone, cachedCustomerId }) {
    if (email) {
      return this.findOne({
        $or: [{ emails: { $in: [email] } }, { primaryEmail: email }],
      });
    }

    if (phone) {
      return this.findOne({
        $or: [{ phones: { $in: [phone] } }, { primaryPhone: phone }],
      });
    }

    if (cachedCustomerId) {
      return this.findOne({ _id: cachedCustomerId });
    }

    return null;
  }

  /**
   * Create a new customer
   * @param  {Object} doc Customer object without computational fields
   * @return {Promise} Newly created customer object
   */
  static async createCustomer(doc) {
    const customer = await this.create({
      ...doc,
      createdAt: new Date(),
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
   * @return {Promise} Newly created customer object
   */
  static async createMessengerCustomer(doc, customData) {
    doc.messengerData = {
      lastSeenAt: new Date(),
      isActive: true,
      sessionCount: 1,
      customData: customData,
    };

    this.assignFields(customData || {}, doc);

    return this.createCustomer(doc);
  }

  /**
   * Update messenger customer data
   * @param  {Object} _id - Customer id
   * @param  {Object} doc - Customer object without computational fields
   * @param  {Object} customData - plan, domain etc ...
   * @return {Promise} - updated customer
   */
  static async updateMessengerCustomer(_id, doc, customData) {
    doc['messengerData.customData'] = customData;

    this.assignFields(customData || {}, doc);

    await this.findByIdAndUpdate(_id, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Get or create customer
   * @param  {Object} doc Expected customer object
   * @return {Promise} Existing or newly created customer object
   */
  static async getOrCreateCustomer({ email, ...doc }) {
    const customer = await this.getCustomer({ email, ...doc });

    if (customer) {
      return customer;
    }

    return this.createCustomer({ primaryEmail: email, emails: [email], ...doc });
  }

  /**
   * Mark customer as active
   * @param  {String} customerId
   * @return {Promise} Updated customer
   */
  static async markCustomerAsActive(customerId) {
    await this.update({ _id: customerId }, { $set: { 'messengerData.isActive': true } });

    return this.findOne({ _id: customerId });
  }

  /**
   * Mark customer as inactive
   * @param  {String} customerId
   * @return {Promise} Updated customer
   */
  static async markCustomerAsNotActive(customerId) {
    await this.update(
      { _id: customerId },
      {
        $set: {
          'messengerData.isActive': false,
          'messengerData.lastSeenAt': new Date(),
        },
      },
    );

    return this.findOne({ _id: customerId });
  }

  /*
   * Update messenger session data
   * @param {String} customer id
   * @return {Promise} updated customer
   */
  static async updateMessengerSession({ _id, url }) {
    const now = new Date();
    const customer = await this.findOne({ _id });

    const query = {
      $set: {
        // update messengerData
        'messengerData.lastSeenAt': now,
        'messengerData.isActive': true,
      },
    };

    if (now - customer.messengerData.lastSeenAt > 6 * 1000) {
      // update session count
      query.$inc = { 'messengerData.sessionCount': 1 };

      // save access history by location.pathname
      const urlVisits = customer.urlVisits || {};
      urlVisits[url] = (urlVisits[url] || 0) + 1;

      query.urlVisits = urlVisits;
    }

    // update
    await this.findByIdAndUpdate(_id, query);

    // updated customer
    return this.findOne({ _id });
  }

  /*
   * Update customer's location info
   */
  static async updateLocation(_id, browserInfo) {
    await this.findByIdAndUpdate(
      { _id },
      {
        $set: { location: browserInfo },
      },
    );

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
