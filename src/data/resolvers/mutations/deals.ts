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
      assignedUsers?: string;
      companyIds?: string[];
      customerIds?: string[];
      closeDate?: Date;
      description?: string;
      order?: number;
      productsData?: JSON;
    }
  ) {
    return Deals.create(args);
  }
};
