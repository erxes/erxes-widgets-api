import { Customers } from '../../../db/models';

export default {
  /**
   * Update customer location field
   */
  async saveBrowserInfo(root, { customerId, browserInfo }) {
    await Customers.findByIdAndUpdate(
      { _id: customerId },
      {
        $set: { location: browserInfo },
      },
    );

    return Customers.findOne({ _id: customerId });
  },
};
