import {
  IIntegrationDocument,
  IConversationDocument
} from "../../../db/models";

const daysAsString = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

export const isTimeInBetween = (
  date: Date,
  startTime: string,
  closeTime: string
) => {
  // concatnating time ranges with today's date
  const dateString = date.toLocaleDateString();
  const startDate = new Date(`${dateString} ${startTime}`);
  const closeDate = new Date(`${dateString} ${closeTime}`);

  return startDate <= date && date <= closeDate;
};

const isWeekday = (day: string) => {
  return ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day);
};

const isWeekend = (day: string) => {
  return ["saturday", "sunday"].includes(day);
};

export const isOnline = (
  integration: IIntegrationDocument,
  now = new Date()
) => {
  if (!integration.messengerData) {
    return false;
  }

  const { messengerData } = integration;
  const { availabilityMethod, isOnline, onlineHours } = messengerData;

  /*
   * Manual: We can determine state from isOnline field value when method is manual
   */
  if (availabilityMethod === "manual") {
    return isOnline;
  }

  /*
   * Auto
   */
  const day = daysAsString[now.getDay()];

  if (!onlineHours) {
    return false;
  }

  // check by everyday config
  const everydayConf = onlineHours.find(c => c.day === "everyday");

  if (everydayConf) {
    return isTimeInBetween(now, everydayConf.from, everydayConf.to);
  }

  // check by weekdays config
  const weekdaysConf = onlineHours.find(c => c.day === "weekdays");

  if (weekdaysConf && isWeekday(day)) {
    return isTimeInBetween(now, weekdaysConf.from, weekdaysConf.to);
  }

  // check by weekends config
  const weekendsConf = onlineHours.find(c => c.day === "weekends");

  if (weekendsConf && isWeekend(day)) {
    return isTimeInBetween(now, weekendsConf.from, weekendsConf.to);
  }

  // check by regular day config
  const dayConf = onlineHours.find(c => c.day === day);

  if (dayConf) {
    return isTimeInBetween(now, dayConf.from, dayConf.to);
  }

  return false;
};

export const unreadMessagesSelector = {
  userId: { $exists: true },
  internal: false,
  isCustomerRead: { $ne: true }
};

export const unreadMessagesQuery = (conversations: IConversationDocument[]) => {
  const conversationIds = conversations.map(c => c._id);

  return {
    conversationId: { $in: conversationIds },
    ...unreadMessagesSelector
  };
};
