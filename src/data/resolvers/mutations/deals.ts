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
      assignedUserIds?: string[];
      companyIds?: string[];
      customerIds?: string[];
      closeDate?: Date;
      description?: string;
      order?: number;
      productsData?: any;
    }
  ) {
    return Deals.create(args);
  }
};
