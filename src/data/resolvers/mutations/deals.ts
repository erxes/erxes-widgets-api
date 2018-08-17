import { Deals } from "../../../db/models";

export default {
  /*
   * Create a new deal
   */
  async createDeal(
    root: any,
    args: {
      name: string;
      stageId: string;
      companyIds?: string[];
      customerIds?: string[];
      description?: string;
      productsData?: any;
    }
  ) {
    return Deals.create(args);
  }
};
