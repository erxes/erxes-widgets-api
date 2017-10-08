import mongoose from 'mongoose';
import Random from 'meteor-random';

const CompanySchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  name: {
    type: String,
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

  plan: {
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
  static createCompany(doc) {
    return this.create(doc);
  }

  /**
   * Get or create company
   * @param  {Object} company parameters
   * @return {Promise} previously saved company or newly created company object
   */
  static async getOrCreate(doc) {
    const company = await this.findOne({ name: doc.name });

    if (company) {
      return company;
    }

    return this.create(doc);
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
