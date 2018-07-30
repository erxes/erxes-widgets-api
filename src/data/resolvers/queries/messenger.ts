import {
  Conversations,
  Integrations,
  Messages,
  Users
} from "../../../db/models";
import {
  isOnline as isStaffsOnline,
  unreadMessagesQuery,
  unreadMessagesSelector
} from "../utils/messenger";

const isMessengerOnline = async (integrationId: string) => {
  const integration = await Integrations.findOne({ _id: integrationId });

  if (!integration) {
    return false;
  }

  if (!integration.messengerData) {
    return false;
  }

  const {
    availabilityMethod,
    isOnline,
    onlineHours
  } = integration.messengerData;

  const modifiedIntegration = {
    ...integration.toJSON(),
    messengerData: {
      availabilityMethod,
      isOnline,
      onlineHours
    }
  };

  return isStaffsOnline(modifiedIntegration);
};

const messengerSupporters = async (integrationId: string) => {
  const integration = await Integrations.findOne({ _id: integrationId });

  if (!integration) {
    return [];
  }

  const messengerData = integration.messengerData || { supporterIds: [] };

  return Users.find({ _id: { $in: messengerData.supporterIds } });
};

export default {
  getMessengerIntegration(root: any, args: { brandCode: string }) {
    return Integrations.getIntegration(args.brandCode, "messenger");
  },

  conversations(
    root: any,
    args: { integrationId: string; customerId: string }
  ) {
    const { integrationId, customerId } = args;

    return Conversations.find({
      integrationId,
      customerId
    }).sort({ createdAt: -1 });
  },

  async conversationDetail(
    root: any,
    args: { _id: string; integrationId: string }
  ) {
    const { _id, integrationId } = args;

    return {
      messages: await Messages.find({ conversationId: _id }),
      isOnline: await isMessengerOnline(integrationId),
      supporters: await messengerSupporters(integrationId)
    };
  },

  messages(root: any, args: { conversationId: string }) {
    const { conversationId } = args;

    return Messages.find({
      conversationId,
      internal: false
    }).sort({ createdAt: 1 });
  },

  unreadCount(root: any, args: { conversationId: string }) {
    const { conversationId } = args;

    return Messages.count({
      conversationId,
      ...unreadMessagesSelector
    });
  },

  async totalUnreadCount(
    root: any,
    args: { integrationId: string; customerId: string }
  ) {
    const { integrationId, customerId } = args;

    // find conversations
    const convs = await Conversations.find({ integrationId, customerId });

    // find read messages count
    return Messages.count(unreadMessagesQuery(convs));
  }
};
