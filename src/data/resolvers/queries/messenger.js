import { Integrations, Conversations, Messages, Users } from '../../../db/models';
import { isOnline as isStaffsOnline } from '../utils/messengerStatus';

const unreadMessagesQuery = conversations => {
  const conversationIds = conversations.map(c => c._id);

  return {
    conversationId: { $in: conversationIds },
    userId: { $exists: true },
    internal: false,
    isCustomerRead: { $exists: false },
  };
};

export default {
  getMessengerIntegration(root, args) {
    return Integrations.getIntegration(args.brandCode, 'messenger');
  },

  lastUnreadMessage(root, args) {
    const { integrationId, customerId } = args;

    // find conversations
    return Conversations.find({
      integrationId,
      customerId,

      // find read messages count
    }).then(convs => Messages.findOne(unreadMessagesQuery(convs)));
  },

  unreadCount(root, { conversationId }) {
    return Messages.count({
      conversationId,
      userId: { $exists: true },
      internal: false,
      isCustomerRead: { $exists: false },
    });
  },

  totalUnreadCount(root, args) {
    const { integrationId, customerId } = args;

    // find conversations
    return Conversations.find({
      integrationId,
      customerId,

      // find read messages count
    }).then(convs => Messages.count(unreadMessagesQuery(convs)));
  },

  conversations(root, { integrationId, customerId }) {
    return Conversations.find({
      integrationId,
      customerId,
    }).sort({ createdAt: -1 });
  },

  messages(root, { conversationId }) {
    return Messages.find({
      conversationId,
      internal: false,
    }).sort({ createdAt: 1 });
  },

  conversationLastStaff(root, args) {
    const messageQuery = {
      conversationId: args._id,
      userId: { $exists: true },
    };

    return Messages.findOne(messageQuery).then(message =>
      Users.findOne({ _id: message && message.userId }),
    );
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
