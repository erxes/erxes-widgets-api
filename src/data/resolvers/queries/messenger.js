import { Integrations, Conversations, Messages, Users } from '../../../db/models';
import { isOnline as isStaffsOnline } from '../utils/messengerStatus';

const unreadMessagesSelector = {
  userId: { $exists: true },
  internal: false,
  isCustomerRead: { $ne: true },
};

const unreadMessagesQuery = conversations => {
  const conversationIds = conversations.map(c => c._id);

  return {
    conversationId: { $in: conversationIds },
    ...unreadMessagesSelector,
  };
};

export default {
  getMessengerIntegration(root, args) {
    return Integrations.getIntegration(args.brandCode, 'messenger');
  },

  async lastUnreadMessage(root, args) {
    const { integrationId, customerId } = args;

    // find conversations
    const convs = await Conversations.find({
      integrationId,
      customerId,
    });

    // find unread messages count
    return Messages.findOne(unreadMessagesQuery(convs));
  },

  unreadCount(root, { conversationId }) {
    return Messages.count({
      conversationId,
      ...unreadMessagesSelector,
    });
  },

  async totalUnreadCount(root, args) {
    const { integrationId, customerId } = args;

    // find conversations
    const convs = await Conversations.find({
      integrationId,
      customerId,
    });

    return Messages.count(unreadMessagesQuery(convs));
  },

  conversations(root, { integrationId, customerId }) {
    return Conversations.find({
      integrationId,
      customerId,
    }).sort({ createdAt: -1 });
  },

  conversationDetail(root, { _id }) {
    return Conversations.findOne({ _id });
  },

  messages(root, { conversationId }) {
    return Messages.find({
      conversationId,
      internal: false,
    }).sort({ createdAt: 1 });
  },

  async messengerSupporters(root, { integrationId }) {
    const integration = await Integrations.findOne({ _id: integrationId });
    const messengerData = integration.messengerData || {};

    return Users.find({ _id: { $in: messengerData.supporterIds || [] } });
  },

  isMessengerOnline(root, args) {
    return Integrations.findOne({ _id: args.integrationId }).then(integration => {
      const { availabilityMethod, isOnline, onlineHours } = integration.messengerData || {};
      const modifiedIntegration = Object.assign({}, integration, {
        availabilityMethod,
        isOnline,
        onlineHours,
      });

      return isStaffsOnline(modifiedIntegration);
    });
  },
};
