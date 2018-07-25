import { Model, model } from "mongoose";
import { mutateAppApi } from "../../utils";
import { customerSchema, ICustomerDocument } from "./definations/customers";

interface IGetCustomerParams {
  email?: string;
  phone?: string;
  cachedCustomerId?: string;
}

interface ICreateCustomerParams {
  integrationId: string;
  email?: string;
  phone?: string;
  isUser?: boolean;
  firstName?: string;
  lastName?: string;
  description?: string;
  messengerData?: any;
}

export interface IUpdateMessengerCustomerParams {
  _id: string;
  doc: {
    email?: string;
    phone?: string;
    isUser?: boolean;
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

  getOrCreateCustomer(
    getParams: IGetCustomerParams,
    createParams: ICreateCustomerParams
  ): Promise<ICustomerDocument>;

  createMessengerCustomer(
    doc: ICreateCustomerParams,
    customData: any
  ): Promise<ICustomerDocument>;

  updateMessengerCustomer(
    param: IUpdateMessengerCustomerParams
  ): Promise<ICustomerDocument>;

  markCustomerAsActive(customerId: string): Promise<ICustomerDocument>;
  markCustomerAsNotActive(customerId: string): Promise<ICustomerDocument>;

  updateMessengerSession(doc: {
    _id: string;
    url: string;
  }): Promise<ICustomerDocument>;

  updateLocation(
    _id: string,
    browserInfo: IBrowserInfo
  ): Promise<ICustomerDocument>;
  addCompany(_id: string, companyId: string): Promise<ICustomerDocument>;
  saveVisitorContactInfo(
    doc: IVisitorContactInfoParams
  ): Promise<ICustomerDocument>;
}

class Customer {
  /*
   * Fix firstName, lastName, description abbriviations
   */
  public static fixCustomData(
    customData: any
  ): { extractedInfo: any; updatedCustomData: any } {
    const extractedInfo: any = {};
    const updatedCustomData = { ...customData };

    // Setting customData fields to customer fields
    Object.keys(updatedCustomData).forEach(key => {
      if (key === "first_name" || key === "firstName") {
        extractedInfo.firstName = updatedCustomData[key];

        delete updatedCustomData[key];
      }

      if (key === "last_name" || key === "lastName") {
        extractedInfo.lastName = updatedCustomData[key];

        delete updatedCustomData[key];
      }

      if (key === "bio" || key === "description") {
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
        $or: [{ emails: { $in: [email] } }, { primaryEmail: email }]
      });
    }

    if (phone) {
      return Customers.findOne({
        $or: [{ phones: { $in: [phone] } }, { primaryPhone: phone }]
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
      createdAt: new Date()
    };

    if (email) {
      modifier.primaryEmail = email;
      modifier.emails = [email];
    }

    if (phone) {
      modifier.primaryPhone = phone;
      modifier.phones = [phone];
    }

    const customer = await Customers.create(modifier);

    // call app api's create customer log
    mutateAppApi(`
      mutation {
        activityLogsAddCustomerLog(_id: "${customer._id}") {
          _id
        }
      }`);

    return customer;
  }

  /*
   * Create a new messenger customer
   */
  public static async createMessengerCustomer(
    doc: ICreateCustomerParams,
    customData: any
  ) {
    const { extractedInfo, updatedCustomData } = this.fixCustomData(
      customData || {}
    );

    return this.createCustomer({
      ...doc,
      ...extractedInfo,
      messengerData: {
        lastSeenAt: new Date(),
        isActive: true,
        sessionCount: 1,
        customData: updatedCustomData
      }
    });
  }

  /*
   * Update messenger customer
   */
  public static async updateMessengerCustomer(
    param: IUpdateMessengerCustomerParams
  ) {
    const { _id, doc, customData } = param;

    const customer = await Customers.findOne({ _id });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const messengerData = customer.messengerData;

    const { extractedInfo, updatedCustomData } = this.fixCustomData(
      customData || {}
    );

    const modifier = {
      ...doc,
      ...extractedInfo,
      "messengerData.customData": updatedCustomData
    };

    await Customers.update({ _id }, { $set: modifier });

    return Customers.findOne({ _id });
  }

  /**
   * Get or create customer
   */
  public static async getOrCreateCustomer(
    getParams: IGetCustomerParams,
    createParams: ICreateCustomerParams
  ) {
    const customer = await this.getCustomer(getParams);

    if (customer) {
      return customer;
    }

    return this.createCustomer(createParams);
  }

  /**
   * Mark customer as active
   */
  public static async markCustomerAsActive(customerId: string) {
    await Customers.update(
      { _id: customerId },
      { $set: { "messengerData.isActive": true } }
    );

    return Customers.findOne({ _id: customerId });
  }

  /**
   * Mark customer as inactive
   */
  public static async markCustomerAsNotActive(customerId: string) {
    await Customers.update(
      { _id: customerId },
      {
        $set: {
          "messengerData.isActive": false,
          "messengerData.lastSeenAt": new Date()
        }
      }
    );

    return Customers.findOne({ _id: customerId });
  }

  /*
   * Update messenger session data
   */
  public static async updateMessengerSession(doc: {
    _id: string;
    url: string;
  }) {
    const { _id, url } = doc;

    const now = new Date();
    const customer = await Customers.findOne({ _id });

    if (!customer) {
      return null;
    }

    // TODO: check any
    const query: any = {
      $set: {
        // update messengerData
        "messengerData.lastSeenAt": now,
        "messengerData.isActive": true
      }
    };

    const messengerData = customer.messengerData;

    // TODO: check getTime
    if (messengerData && now.getTime() - messengerData.lastSeenAt > 6 * 1000) {
      // update session count
      query.$inc = { "messengerData.sessionCount": 1 };

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

  /*
   * Update customer's location info
   */
  public static async updateLocation(_id: string, browserInfo: IBrowserInfo) {
    await Customers.findByIdAndUpdate(
      { _id },
      {
        $set: { location: browserInfo }
      }
    );

    return Customers.findOne({ _id });
  }

  /*
   * Add companyId to companyIds list
   */
  public static async addCompany(_id: string, companyId: string) {
    await Customers.findByIdAndUpdate(_id, {
      $addToSet: { companyIds: companyId }
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

    if (type === "email") {
      await Customers.update(
        { _id: customerId },
        { "visitorContactInfo.email": value }
      );
    }

    if (type === "phone") {
      await Customers.update(
        { _id: customerId },
        { "visitorContactInfo.phone": value }
      );
    }

    return Customers.findOne({ _id: customerId });
  }
}

customerSchema.loadClass(Customer);

const Customers = model<ICustomerDocument, ICustomerModel>(
  "customers",
  customerSchema
);

export default Customers;
