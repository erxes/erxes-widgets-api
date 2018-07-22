import { Document, Model, Schema, model } from 'mongoose';
import * as Random from 'meteor-random';
import { mutateAppApi } from '../../utils';
import { ICompanyDocument, CompanySchema } from './definations/companies';

interface ICompanyModel extends Model<ICompanyDocument> {
  getOrCreate(doc: object): ICompanyDocument
  createCompany(doc: object): ICompanyDocument
}

class Company {
  /**
   * Create a company
   * @param  {Object} companyObj object
   * @return {Promise} Newly created company object
   */
  static async createCompany(doc) {
    const { name, ...restDoc } = doc;

    const company = await Companies.create({
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
    const company = await Companies.findOne({
      $or: [{ names: { $in: [doc.name] } }, { primaryName: doc.name }],
    });

    if (company) {
      return company;
    }

    return this.createCompany(doc);
  }
}

CompanySchema.loadClass(Company);

const Companies = model<ICompanyDocument, ICompanyModel>('companies', CompanySchema);

export default Companies;
