import _ from 'underscore';
import { Integrations, Conversations, Messages, Users } from './connectors';
import { checkAvailability } from './check-availability';

export default {
  conversations(root, args) {
    const { integrationId, customerId } = args;

    return Conversations.find({
      integrationId,
      customerId,
    }).sort({ createdAt: -1 });
  },

  messages(root, { conversationId }) {
    return Messages.find({ conversationId, internal: false }).sort({ createdAt: 1 });
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
    })

    .then((conversations) => {
      const conversationIds = _.pluck(conversations, '_id');

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
    return Integrations.findOne({ _id: args.integrationId }).then(integ => {
      integ.availabilityMethod = integ.messengerData.availabilityMethod;
      integ.isOnline = integ.messengerData.isOnline;
      integ.onlineHours = integ.messengerData.onlineHours;

      return checkAvailability(integ, new Date())
    });
  },
};
