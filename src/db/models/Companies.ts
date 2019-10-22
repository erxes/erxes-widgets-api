import { Model, model } from 'mongoose';
import { sendMessage } from '../../messageQueue';
import { companySchema, ICompanyDocument } from './definitions/companies';

interface ICompanyDoc {
  id?: string;
  name: string;
  plan?: string;
}

interface ICompanyModel extends Model<ICompanyDocument> {
  getOrCreate(doc: ICompanyDoc): ICompanyDocument;
  createCompany(doc: ICompanyDoc): ICompanyDocument;
}

export const loadClass = () => {
  class Company {
    /**
     * Create a company
     */
    public static async createCompany(doc: ICompanyDoc) {
      const { name, ...restDoc } = doc;

      const company = await Companies.create({
        createdAt: new Date(),
        modifiedAt: new Date(),
        primaryName: name,
        names: [name],
        searchText: [doc.name, doc.plan || ''].join(' '),
        ...restDoc,
      });

      // notify main api
      sendMessage('activityLog', {
        type: 'create-company',
        payload: company,
      });

      return company;
    }

    /**
     * Get or create company
     */
    public static async getOrCreate(doc: ICompanyDoc) {
      const company = await Companies.findOne({
        $or: [{ names: { $in: [doc.name] } }, { primaryName: doc.name }],
      });

      if (company) {
        return company;
      }

      return this.createCompany(doc);
    }
  }

  companySchema.loadClass(Company);

  return companySchema;
};

loadClass();

// tslint:disable-next-line
const Companies = model<ICompanyDocument, ICompanyModel>('companies', companySchema);

export default Companies;
