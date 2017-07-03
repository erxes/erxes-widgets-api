import { EngageMessages } from '../../../db/models';

export default {
  readEngageMessage(root, args) {
    const { messageId, customerId } = args;

    return EngageMessages.update(
      { _id: messageId },
      { $push: { messengerReceivedCustomerIds: customerId } },
      {},
      () => {},
    );
  },
};
