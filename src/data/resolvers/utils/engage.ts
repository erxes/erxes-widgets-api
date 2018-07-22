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

  // contains
  if (condition === 'contains' && valueToTest && !valueToTest.includes(ruleValue)) {
    return false;
  }

  // greaterThan
  if (condition === 'greaterThan' && valueToTest < parseInt(ruleValue)) {
    return false;
  }

  if (condition === 'lessThan' && valueToTest > parseInt(ruleValue)) {
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
 * Creates or update conversation & message object using given info
 * @return Promise
 */
export const createOrUpdateConversationAndMessages = async args => {
  const { customer, integration, user, engageData } = args;

  const prevMessage = await Messages.findOne({
    customerId: customer._id,
    'engageData.messageId': engageData.messageId,
  });

  // if previously created conversation for this customer
  if (prevMessage) {
    const messages = await Messages.find({
      conversationId: prevMessage.conversationId,
    });

    // leave conversations with responses alone
    if (messages.length > 1) {
      return null;
    }

    // mark as unread again && reset engageData
    await Messages.update(
      { _id: prevMessage._id },
      { $set: { engageData, isCustomerRead: false } },
    );

    return null;
  }

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
  return Messages.createMessage({
    engageData,
    conversationId: conversation._id,
    userId: user._id,
    customerId: customer._id,
    content: replacedContent,
  });
};

/*
 * This function will be used in messagerConnect and it will create conversations
 * when visitor messenger connect
 *
 * @return Promise
 */
export const createEngageVisitorMessages = async params => {
  const { brand, integration, customer, browserInfo } = params;

  // force read previous unread engage messages ============
  await Messages.forceReadCustomerPreviousEngageMessages(customer._id);

  const messages = await EngageMessages.find({
    'messenger.brandId': brand._id,
    kind: 'visitorAuto',
    method: 'messenger',
    isLive: true,
  });

  const conversationMessages = [];

  for (let message of messages) {
    const user = await Users.findOne({ _id: message.fromUserId });

    // check for rules ===
    const urlVisits = customer.urlVisits || {};

    const isPassedAllRules = await checkRules({
      rules: message.messenger.rules,
      browserInfo,
      numberOfVisits: urlVisits[browserInfo.url] || 0,
    });

    // if given visitor is matched with given condition then create
    // conversations
    if (isPassedAllRules) {
      const conversationMessage = await createOrUpdateConversationAndMessages({
        customer,
        integration,
        user,
        engageData: {
          ...message.messenger,
          messageId: message._id,
          fromUserId: message.fromUserId,
        },
      });

      if (conversationMessage) {
        // collect created messages
        conversationMessages.push(conversationMessage);

        // add given customer to customerIds list
        await EngageMessages.update({ _id: message._id }, { $push: { customerIds: customer._id } });
      }
    }
  }

  // newly created conversation messages
  return conversationMessages;
};
