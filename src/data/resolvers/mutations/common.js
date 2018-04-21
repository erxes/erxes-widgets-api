import { Customers } from '../../../db/models';

export default {
  /**
   * Update customer location field
   */
  async saveBrowserInfo(root, { customerId, browserInfo }) {
    return Customers.updateLocation(customerId, browserInfo);
  },
};
