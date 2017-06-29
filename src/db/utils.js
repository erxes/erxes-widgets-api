import nodemailer from 'nodemailer';
import { Messages, Conversations, Brands, Customers, Integrations } from './models';

export const CONVERSATION_STATUSES = {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ALL_LIST: ['new', 'open', 'closed'],
};

/**
 * Get integration
 * @param  {String} brandCode
 * @param  {String} kind
 * @return {Promise} Existing integration object
 */
export const getIntegration = (brandCode, kind) =>
  Brands.findOne({ code: brandCode }).then(brand =>
    Integrations.findOne({
      brandId: brand._id,
      kind,
    }),
  );

/**
 * Get customer
 * @param  {String} integrationId
 * @param  {String} email
 * @return {Promise} Existing customer object
 */
export const getCustomer = (integrationId, email) => Customers.findOne({ email, integrationId });

/**
 * Create a new customer
 * @param  {Object} customerObj Customer object without computational fields
 * @return {Promise} Newly created customer object
 */
export const createCustomer = customerObj => {
  const now = new Date();
  const customer = new Customers({
    ...customerObj,
    createdAt: now,
    messengerData: {
      lastSeenAt: now,
      isActive: true,
      sessionCount: 1,
    },
  });

  return customer.save();
};

/**
 * Get or create customer
 * @param  {Object} customerObj Expected customer object
 * @return {Promise} Existing or newly created customer object
 */
export const getOrCreateCustomer = customerObj => {
  const { integrationId, email } = customerObj;

  return getCustomer(integrationId, email).then(customer => {
    if (customer) {
      return Promise.resolve(customer);
    }

    return createCustomer(customerObj);
  });
};

/**
 * Create new conversation
 * @param  {Object} conversationObj
 * @return {Promise} Newly created conversation object
 */
export const createConversation = conversationObj => {
  const { integrationId, customerId, content } = conversationObj;

  return Conversations.find({ customerId, integrationId }).count().then(count => {
    const conversation = new Conversations({
      customerId,
      integrationId,
      content,
      status: CONVERSATION_STATUSES.NEW,
      createdAt: new Date(),

      // QUESTION: What is this number for?
      number: count + 1,

      messageCount: 0,
    });

    return conversation.save();
  });
};

/**
 * Get or create conversation
 * @param  {Object} doc
 * @return {Promise}
 */
export const getOrCreateConversation = doc => {
  const { conversationId, integrationId, customerId, message } = doc;

  // customer can write a message
  // to the closed conversation even if it's closed
  if (conversationId) {
    return Conversations.findByIdAndUpdate(
      conversationId,
      {
        // mark this conversation as unread
        readUserIds: [],

        // reopen this conversation if it's closed
        status: CONVERSATION_STATUSES.OPEN,
      },
      { new: true },
    );
  }

  // create conversation
  return createConversation({
    customerId,
    integrationId,
    content: message,
  });
};

/**
 * Create new message
 * @param  {Object} messageObj
 * @return {Promise} New message
 */
export const createMessage = messageObj => {
  const message = new Messages({
    createdAt: new Date(),
    internal: false,
    ...messageObj,
  });

  return message.save();
};

/**
 * Mark customer as inactive
 * @param  {String} customerId
 * @return {Promise} Updated customer
 */
export const markCustomerAsNotActive = customerId => {
  return Customers.findByIdAndUpdate(
    customerId,
    {
      $set: {
        'messengerData.isActive': false,
        'messengerData.lastSeenAt': new Date(),
      },
    },
    { new: true },
  );
};

export const sendEmail = ({ toEmails, fromEmail, title, content }) => {
  const { MAIL_SERVICE, MAIL_USER, MAIL_PASS } = process.env;

  const transporter = nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  toEmails.forEach(toEmail => {
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: title,
      text: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      console.log(error); // eslint-disable-line
      console.log(info); // eslint-disable-line
    });
  });
};
