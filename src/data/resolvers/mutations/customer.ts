import { Customers } from "../../../db/models";

export default {
  /*
   * Create a new deal
   */
  async updateCustomer(_root, { _id, email }: { _id: string; email: string }) {
    return Customers.updateMessengerCustomer({ _id, doc: { email } });
  }
};
