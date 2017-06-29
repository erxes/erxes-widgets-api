import { Integrations, Conversations, Messages, Users } from '../../db/models';
import { isOnline as isStaffsOnline } from './utils/messengerStatus';
import { getIntegration } from '../../db/utils';

export default {
  getMessengerIntegration(root, args) {
    return getIntegration(args.brandCode, 'messenger');
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

  unreadCount(root, { conversationId }) {
    return Messages.count({
      conversationId,
      userId: { $exists: true },
      internal: false,
      isCustomerRead: { $exists: false },
    });
  },

  totalUnreadCount(root, { integrationId, customerId }) {
    // find conversations
    return Conversations.find({
      integrationId,
      customerId,
    }).then(conversations => {
      const conversationIds = conversations.map(c => c._id);

      // find read messages count
      return Messages.count({
        conversationId: { $in: conversationIds },
        userId: { $exists: true },
        internal: false,
        isCustomerRead: { $exists: false },
      });
    });
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
