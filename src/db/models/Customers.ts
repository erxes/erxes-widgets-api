import { Model, model } from 'mongoose';
import { customerSchema, ICustomerDocument } from './definitions/customers';
interface IGetCustomerParams {
  email?: string;
  phone?: string;
  cachedCustomerId?: string;
}

interface ICreateCustomerParams {
  integrationId?: string;
  email?: string;
  hasValidEmail?: boolean;
  phone?: string;
  isUser?: boolean;
  firstName?: string;
  lastName?: string;
  description?: string;
  messengerData?: any;
  deviceToken?: string;
}

export interface IUpdateMessengerCustomerParams {
  _id: string;
  doc: {
    email?: string;
    phone?: string;
    isUser?: boolean;
    deviceToken?: string;
  };
  customData?: any;
}

export interface IVisitorContactInfoParams {
  customerId: string;
  type: string;
  value: string;
}

export interface IBrowserInfo {
  language?: string;
  url?: string;
  city?: string;
  country?: string;
}

interface ICustomerModel extends Model<ICustomerDocument> {
  getCustomer(doc: IGetCustomerParams): Promise<ICustomerDocument>;

  getOrCreateCustomer(getParams: IGetCustomerParams, createParams: ICreateCustomerParams): Promise<ICustomerDocument>;

  createMessengerCustomer(doc: ICreateCustomerParams, customData: any): Promise<ICustomerDocument>;

  updateMessengerCustomer(param: IUpdateMessengerCustomerParams): Promise<ICustomerDocument>;

  markCustomerAsActive(customerId: string): Promise<ICustomerDocument>;
  markCustomerAsNotActive(customerId: string): Promise<ICustomerDocument>;

  updateMessengerSession(_id: string, url: string): Promise<ICustomerDocument>;
  updateLocation(_id: string, browserInfo: IBrowserInfo): Promise<ICustomerDocument>;
  addCompany(_id: string, companyId: string): Promise<ICustomerDocument>;
  saveVisitorContactInfo(doc: IVisitorContactInfoParams): Promise<ICustomerDocument>;
}

export const loadClass = () => {
  class Customer {
    /*
     * Fix firstName, lastName, description abbriviations
     */
    public static fixCustomData(customData: any): { extractedInfo: any; updatedCustomData: any } {
      const extractedInfo: any = {};
      const updatedCustomData = { ...customData };

      // Setting customData fields to customer fields
      Object.keys(updatedCustomData).forEach(key => {
        if (key === 'first_name' || key === 'firstName') {
          extractedInfo.firstName = updatedCustomData[key];

          delete updatedCustomData[key];
        }

        if (key === 'last_name' || key === 'lastName') {
          extractedInfo.lastName = updatedCustomData[key];

          delete updatedCustomData[key];
        }

        if (key === 'bio' || key === 'description') {
          extractedInfo.description = updatedCustomData[key];

          delete updatedCustomData[key];
        }
      });

      return { extractedInfo, updatedCustomData };
    }

    /*
     * Get customer
     */
    public static getCustomer(params: IGetCustomerParams) {
      const { email, phone, cachedCustomerId } = params;

      if (email) {
        return Customers.findOne({
          $or: [{ emails: { $in: [email] } }, { primaryEmail: email }],
        });
      }

      if (phone) {
        return Customers.findOne({
          $or: [{ phones: { $in: [phone] } }, { primaryPhone: phone }],
        });
      }

      if (cachedCustomerId) {
        return Customers.findOne({ _id: cachedCustomerId });
      }

      return null;
    }

    /*
     * Create a new customer
     */
    public static async createCustomer(doc: ICreateCustomerParams) {
      const { email, phone, ...restDoc } = doc;

      const modifier: any = {
        ...restDoc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      if (email) {
        modifier.primaryEmail = email;
        modifier.emails = [email];
      }

      if (phone) {
        modifier.primaryPhone = phone;
        modifier.phones = [phone];
      }

      return Customers.create(modifier);
    }

    /*
     * Create a new messenger customer
     */
    public static async createMessengerCustomer(doc: ICreateCustomerParams, customData: any) {
      const { extractedInfo, updatedCustomData } = this.fixCustomData(customData || {});
      return this.createCustomer({
        ...doc,
        ...extractedInfo,
        deviceTokens: [doc.deviceToken],
        messengerData: {
          lastSeenAt: new Date(),
          isActive: true,
          sessionCount: 1,
          customData: updatedCustomData,
        },
      });
    }

    /*
     * Update messenger customer
     */
    public static async updateMessengerCustomer(param: IUpdateMessengerCustomerParams) {
      const { _id, doc, customData } = param;

      const customer = await Customers.findOne({ _id });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const { extractedInfo, updatedCustomData } = this.fixCustomData(customData || {});

      const emails = customer.emails || [];

      if (doc.email && !emails.includes(doc.email)) {
        emails.push(doc.email);
      }

      const phones = customer.phones || [];

      if (doc.phone && !phones.includes(doc.phone)) {
        phones.push(doc.phone);
      }

      const deviceTokens: string[] = customer.deviceTokens || [];

      if (doc.deviceToken) {
        if (!deviceTokens.includes(doc.deviceToken)) {
          deviceTokens.push(doc.deviceToken);
        }

        delete doc.deviceToken;
      }

      const modifier = {
        ...doc,
        ...extractedInfo,
        phones,
        emails,
        modifiedAt: new Date(),
        deviceTokens,
        'messengerData.customData': updatedCustomData,
      };

      await Customers.updateOne({ _id }, { $set: modifier });

      return Customers.findOne({ _id });
    }

    /**
     * Get or create customer
     */
    public static async getOrCreateCustomer(getParams: IGetCustomerParams, createParams: ICreateCustomerParams) {
      const customer = await this.getCustomer(getParams);

      if (customer) {
        return customer;
      }

      return this.createCustomer(createParams);
    }

    /*
     * Update messenger session data
     */
    public static async updateMessengerSession(_id: string, url: string) {
      const now = new Date();
      const customer = await Customers.findOne({ _id });

      if (!customer) {
        return null;
      }

      const query: any = {
        $set: {
          // update messengerData
          'messengerData.lastSeenAt': now,
          'messengerData.isActive': true,
        },
      };

      const messengerData = customer.messengerData;

      // Preventing session count to increase on page every refresh
      // Close your web site tab and reopen it after 6 seconds then it will increase
      // session count by 1
      if (messengerData && now.getTime() - messengerData.lastSeenAt > 6 * 1000) {
        // update session count
        query.$inc = { 'messengerData.sessionCount': 1 };

        // save access history by location.pathname
        const urlVisits = customer.urlVisits || {};

        urlVisits[url] = (urlVisits[url] || 0) + 1;

        query.urlVisits = urlVisits;
      }

      // update
      await Customers.findByIdAndUpdate(_id, query);

      // updated customer
      return Customers.findOne({ _id });
    }

    /**
     * Mark customer as active
     */
    public static async markCustomerAsActive(customerId: string) {
      await Customers.updateOne({ _id: customerId }, { $set: { 'messengerData.isActive': true } });

      return Customers.findOne({ _id: customerId });
    }

    /**
     * Mark customer as inactive
     */
    public static async markCustomerAsNotActive(customerId: string) {
      await Customers.updateOne(
        { _id: customerId },
        {
          $set: {
            'messengerData.isActive': false,
            'messengerData.lastSeenAt': new Date(),
          },
        },
      );

      return Customers.findOne({ _id: customerId });
    }

    /*
     * Update customer's location info
     */
    public static async updateLocation(_id: string, browserInfo: IBrowserInfo) {
      await Customers.findByIdAndUpdate(
        { _id },
        {
          $set: { location: browserInfo },
        },
      );

      return Customers.findOne({ _id });
    }

    /*
     * Add companyId to companyIds list
     */
    public static async addCompany(_id: string, companyId: string) {
      await Customers.findByIdAndUpdate(_id, {
        $addToSet: { companyIds: companyId },
      });

      // updated customer
      return Customers.findOne({ _id });
    }

    /*
     * If customer is a visitor then we will contact with this customer using
     * this information later
     */
    public static async saveVisitorContactInfo(args: IVisitorContactInfoParams) {
      const { customerId, type, value } = args;

      if (type === 'email') {
        await Customers.updateOne(
          { _id: customerId },
          {
            'visitorContactInfo.email': value,
          },
        );
      }

      if (type === 'phone') {
        await Customers.updateOne({ _id: customerId }, { 'visitorContactInfo.phone': value });
      }

      return Customers.findOne({ _id: customerId });
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};

loadClass();

// tslint:disable-next-line
const Customers = model<ICustomerDocument, ICustomerModel>('customers', customerSchema);

export default Customers;
