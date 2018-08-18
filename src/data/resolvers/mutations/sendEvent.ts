import { Deals } from "../../../db/models";
import { IDealInput } from "../../../db/models/Deals";

interface ISendEvent {
  type: string;
  doc: IDealInput;
}

export default {
  /*
   * Create a new deal
   */
  async sendEvent(root: any, args: ISendEvent) {
    const { type, doc } = args;

    if (type === "createDeal") {
      return Deals.createDeal(doc);
    }
  }
};
