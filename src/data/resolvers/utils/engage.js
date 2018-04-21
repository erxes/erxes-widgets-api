import { Users, EngageMessages, Conversations, Messages } from '../../../db/models';

/*
 * replaces customer & user infos in given content
 * @return String
 */
export const replaceKeys = ({ content, customer, user }) => {
  let result = content;

  // replace customer fields
  result = result.replace(/{{\s?customer.name\s?}}/gi, customer.name);
  result = result.replace(/{{\s?customer.email\s?}}/gi, customer.email);

  // replace user fields
  result = result.replace(/{{\s?user.fullName\s?}}/gi, user.fullName);
  result = result.replace(/{{\s?user.position\s?}}/gi, user.position);
  result = result.replace(/{{\s?user.email\s?}}/gi, user.email);

  return result;
};

/*
 * checks individual rule
 * @return boolean
 */
export const checkRule = ({ rule, browserInfo, numberOfVisits }) => {
  const { language, url, city, country } = browserInfo;
  const { kind, condition } = rule;
  const ruleValue = rule.value;

  let valueToTest;

  if (kind === 'browserLanguage') {
    valueToTest = language;
  }

  if (kind === 'currentPageUrl') {
    valueToTest = url;
  }

  if (kind === 'city') {
    valueToTest = city;
  }

  if (kind === 'country') {
    valueToTest = country;
  }

  if (kind === 'numberOfVisits') {
    valueToTest = numberOfVisits;
  }

  // is
  if (condition === 'is' && valueToTest !== ruleValue) {
    return false;
  }

  // isNot
  if (condition === 'isNot' && valueToTest === ruleValue) {
    return false;
  }

  // isUnknown
  if (condition === 'isUnknown' && valueToTest) {
    return false;
  }

  // hasAnyValue
  if (condition === 'hasAnyValue' && !valueToTest) {
    return false;
  }

  // startsWith
  if (condition === 'startsWith' && !valueToTest.startsWith(ruleValue)) {
    return false;
  }

  // endsWith
  if (condition === 'endsWith' && !valueToTest.endsWith(ruleValue)) {
    return false;
  }

  // greaterThan
  if (condition === 'greaterThan' && valueToTest < ruleValue) {
    return false;
  }

  // lessThan
  if (condition === 'lessThan' && valueToTest > ruleValue) {
    return false;
  }

  return true;
};

/*
 * this function determines whether or not current visitor's information
 * satisfying given engage message's rules
 * @return Promise
 */
export const checkRules = async ({ rules, browserInfo, numberOfVisits }) => {
  let passedAllRules = true;

  rules.forEach(rule => {
    // check individual rule
    if (!checkRule({ rule, browserInfo, numberOfVisits })) {
      passedAllRules = false;
      return;
    }
  });

  return passedAllRules;
};

/*
 * Creates conversation & message object using given info
 * @return Promise
 */
export const createConversationAndMessages = async args => {
  const { customer, integration, user, engageData } = args;

  // replace keys in content
  const replacedContent = replaceKeys({
    content: engageData.content,
    customer: customer,
    user,
  });

  // create conversation
  const conversation = await Conversations.createConversation({
    userId: user._id,
    customerId: customer._id,
    integrationId: integration._id,
    content: replacedContent,
  });

  // create message
  const message = await Messages.createMessage({
    engageData,
    conversationId: conversation._id,
    userId: user._id,
    customerId: customer._id,
    content: replacedContent,
  });

  return {
    conversation,
    message,
  };
};

/*
 * this function will be used in messagerConnect and it will create conversations
 * when visitor messenger connect * @return Promise
 */
export const createEngageVisitorMessages = async params => {
  const { brand, integration, customer, browserInfo } = params;

  // find engage messages
  const messengerData = integration.messengerData || {};

  // if integration configured as hide conversations
  // then do not create any engage messages
  if (messengerData.hideConversationList) {
    return [];
  }

  const messages = await EngageMessages.find({
    'messenger.brandId': brand._id,
    kind: 'visitorAuto',
    method: 'messenger',
    isLive: true,
    customerIds: { $nin: [customer._id] },
  });

  const conversations = [];

  for (let message of messages) {
    const user = await Users.findOne({ _id: message.fromUserId });

    // check for rules
    const isPassedAllRules = await checkRules({
      rules: message.messenger.rules,
      browserInfo,
      numberOfVisits: customer.messengerData.sessionCount || 0,
    });

    // if given visitor is matched with given condition then create
    // conversations
    if (isPassedAllRules) {
      const { conversation } = await createConversationAndMessages({
        customer,
        integration,
        user,
        engageData: {
          ...message.messenger,
          messageId: message._id,
          fromUserId: message.fromUserId,
        },
      });

      // collect created conversations
      conversations.push(conversation);

      // add given customer to customerIds list
      await EngageMessages.update(
        { _id: message._id },
        { $push: { customerIds: customer._id } },
        {},
        () => {},
      );
    }
  }

  // newly created conversations
  return conversations;
};
