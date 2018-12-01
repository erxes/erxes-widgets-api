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
  getMessengerIntegration(_root, args: { brandCode: string }) {
    return Integrations.getIntegration(args.brandCode, "messenger");
  },

  conversations(_root, args: { integrationId: string; customerId: string }) {
    const { integrationId, customerId } = args;

    return Conversations.find({
      integrationId,
      customerId
    }).sort({ createdAt: -1 });
  },

  async conversationDetail(
    _root,
    args: { _id: string; integrationId: string }
  ) {
    const { _id, integrationId } = args;
    const conversation = await Conversations.findOne({ _id });

    if (!conversation) {
      return null;
    }

    return {
      _id,
      messages: await Conversations.getMessages(conversation._id),
      isOnline: await isMessengerOnline(integrationId),
      participatedUsers: await Users.find({
        _id: { $in: conversation.participatedUserIds }
      }),
      supporters: await messengerSupporters(integrationId)
    };
  },

  messages(_root, args: { conversationId: string }) {
    const { conversationId } = args;

    return Conversations.getMessages(conversationId);
  },

  unreadCount(_root, args: { conversationId: string }) {
    const { conversationId } = args;

    return Messages.count({
      conversationId,
      ...unreadMessagesSelector
    });
  },

  async totalUnreadCount(
    _root,
    args: { integrationId: string; customerId: string }
  ) {
    const { integrationId, customerId } = args;

    // find conversations
    const convs = await Conversations.find({ integrationId, customerId });

    // find read messages count
    return Messages.count(unreadMessagesQuery(convs));
  },

  async messengerSupporters(
    _root,
    { integrationId }: { integrationId: string }
  ) {
    const integration = await Integrations.findOne({ _id: integrationId });
    const messengerData = integration.messengerData;

    return Users.find({ _id: { $in: messengerData.supporterIds || [] } });
  }
};
