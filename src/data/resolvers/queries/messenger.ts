import { Integrations, Conversations, Messages, Users } from '../../../db/models';
import {
  isOnline as isStaffsOnline,
  unreadMessagesSelector,
  unreadMessagesQuery,
} from '../utils/messenger';

const isMessengerOnline = async (integrationId: string) => {
  const integration = await Integrations.findOne({ _id: integrationId });

  const { availabilityMethod, isOnline, onlineHours } = integration.messengerData || {
    availabilityMethod: '', isOnline: false, onlineHours: [] }

  const modifiedIntegration = Object.assign({}, integration, {
    availabilityMethod,
    isOnline,
    onlineHours,
  });

  return isStaffsOnline(modifiedIntegration);
};

const messengerSupporters = async (integrationId: string) => {
  const integration = await Integrations.findOne({ _id: integrationId });
  const messengerData = integration.messengerData || { supporterIds: [] };

  return Users.find({ _id: { $in: messengerData.supporterIds } });
};

export default {
  getMessengerIntegration(root, args: { brandCode: string }) {
    return Integrations.getIntegration(args.brandCode, 'messenger');
  },

  conversations(root, args: { integrationId: string, customerId: string }) {
    const { integrationId, customerId } = args

    return Conversations.find({
      integrationId,
      customerId,
    }).sort({ createdAt: -1 });
  },

  async conversationDetail(root, args: { _id: string, integrationId: string }) {
    const { _id, integrationId } = args

    return {
      messages: await Messages.find({ conversationId: _id }),
      isOnline: await isMessengerOnline(integrationId),
      supporters: await messengerSupporters(integrationId),
    };
  },

  messages(root, args: { conversationId: string }) {
    const { conversationId } = args;

    return Messages.find({
      conversationId,
      internal: false,
    }).sort({ createdAt: 1 });
  },

  unreadCount(root, args: { conversationId: string }) {
    const { conversationId } = args;

    return Messages.count({
      conversationId,
      ...unreadMessagesSelector,
    });
  },

  async totalUnreadCount(root, args: { integrationId: string, customerId: string }) {
    const { integrationId, customerId } = args;

    // find conversations
    const convs = await Conversations.find({ integrationId, customerId });

    // find read messages count
    return Messages.count(unreadMessagesQuery(convs));
  },
};
