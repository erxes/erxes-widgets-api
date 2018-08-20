import { Deals } from "../../../db/models";
import { IDealInput } from "../../../db/models/Deals";

export default {
  /*
   * Create a new deal
   */
  async sendEvent(
    root: any,
    { type, dealDoc }: { type: string; dealDoc: IDealInput }
  ) {
    if (type === "createDeal") {
      return Deals.createDeal(dealDoc);
    }
  }
};
