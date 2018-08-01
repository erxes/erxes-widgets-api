import { Model, model, Schema } from "mongoose";
import { mutateAppApi } from "../../utils";
import { companySchema, ICompanyDocument } from "./definations/companies";

interface ICompanyDoc {
  id?: string;
  name: string;
}

interface ICompanyModel extends Model<ICompanyDocument> {
  getOrCreate(doc: ICompanyDoc): ICompanyDocument;
  createCompany(doc: ICompanyDoc): ICompanyDocument;
}

class Company {
  /**
   * Create a company
   */
  public static async createCompany(doc: ICompanyDoc) {
    const { name, ...restDoc } = doc;

    const company = await Companies.create({
      primaryName: name,
      names: [name],
      ...restDoc
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
   */
  public static async getOrCreate(doc: ICompanyDoc) {
    const company = await Companies.findOne({
      $or: [{ names: { $in: [doc.name] } }, { primaryName: doc.name }]
    });

    if (company) {
      return company;
    }

    return this.createCompany(doc);
  }
}

companySchema.loadClass(Company);

const Companies = model<ICompanyDocument, ICompanyModel>(
  "companies",
  companySchema
);

export default Companies;
