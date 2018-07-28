import mongoose from 'mongoose';
import Random from 'meteor-random';
import { mutateAppApi } from '../../utils';

const CompanySchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  primaryName: {
    type: String,
    optional: true,
  },

  names: {
    type: [String],
    optional: true,
  },

  size: {
    type: Number,
    optional: true,
  },

  industry: {
    type: String,
    optional: true,
  },

  website: {
    type: String,
    optional: true,
  },

  lastSeenAt: Date,
  sessionCount: Number,

  tagIds: {
    type: [String],
    optional: true,
  },
});

class Company {
  /**
   * Create a company
   * @param  {Object} companyObj object
   * @return {Promise} Newly created company object
   */
  static async createCompany(doc) {
    const { name, ...restDoc } = doc;

    const company = await this.create({
      primaryName: name,
      names: [name],
      ...restDoc,
    });

    // call app api's create customer log
    mutateAppApi(`
      mutation {
        activityLogsAddCompanyLog(_id: "${company._id}") {
          _id
        }
      }`);

    return company;
  }

  /**
   * Get or create company
   * @param  {Object} company parameters
   * @return {Promise} previously saved company or newly created company object
   */
  static async getOrCreate(doc) {
    const company = await this.findOne({
      $or: [{ names: { $in: [doc.name] } }, { primaryName: doc.name }],
    });

    if (company) {
      return company;
    }

    return this.createCompany(doc);
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
