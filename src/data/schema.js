export const types = `
  scalar Date
  scalar JSON

  type UserDetails {
    avatar: String
    fullName: String
  }

  type User {
    _id: String!
    details: UserDetails
  }

  type Attachment {
    url: String
    name: String
    type: String
    size: Int
  }

  input AttachmentInput {
    url: String
    name: String
    type: String
    size: Int
  }

  input FieldValueInput {
    _id: String!
    type: String
    validation: String
    text: String
    value: String
  }

  type Integration {
    _id: String!
    uiOptions: JSON
    messengerData: JSON
  }

  type Conversation {
    _id: String!
    customerId: String!
    integrationId: String!
    status: String!
    content: String
    createdAt: Date
    participatedUsers: [User]
    readUserIds: [String]
  }

  type Message {
    _id: String!
    conversationId: String!
    customerId: String
    user: User
    content: String
    createdAt: Date
    attachments: [Attachment]
    internal: Boolean
  }

  type Field {
    _id: String
    formId: String
    type: String
    check: String
    text: String
    description: String
    options: [String]
    isRequired: Boolean
    name: String
    validation: String
    order: Int
  }

  type Form {
    title: String
    fields: [Field]
  }

  type MessengerConnectResponse {
    integrationId: String!
    uiOptions: JSON
    messengerData: JSON
    customerId: String!
  }

  type FormConnectResponse {
    integrationId: String!
    integrationName: String!
    formId: String!
    formData: JSON!
  }

  type Error {
    fieldId: String
    code: String
    text: String
  }
`;

// Schema allows the following queries
export const queries = `
  type Query {
    conversations(integrationId: String!, customerId: String!): [Conversation]
    getMessengerIntegration(brandCode: String!): Integration
    totalUnreadCount(integrationId: String!, customerId: String!): Int
    messages(conversationId: String): [Message]
    unreadCount(conversationId: String): Int
    conversationLastStaff(_id: String): User
    isMessengerOnline(integrationId: String!): Boolean
    form(formId: String): Form
  }
`;

export const mutations = `
  type Mutation {
    messengerConnect(
      brandCode: String!,
      email: String!,
      name: String,
      isUser: Boolean,
      data: JSON
    ): MessengerConnectResponse
    insertMessage(
      integrationId: String!,
      customerId: String!,
      conversationId: String!,
      message: String,
      attachments: [AttachmentInput]
    ): Message
    simulateInsertMessage(messageId: String): Message
    readConversationMessages(conversationId: String): String
    formConnect(brandCode: String!, formCode: String!): FormConnectResponse
    saveForm(integrationId: String!, formId: String!, submissions: [FieldValueInput]): [Error]
    sendEmail(toEmails: [String], fromEmail: String, title: String, content: String): String
  }
`;

export const subscriptions = `
  type Subscription {
    messageInserted(conversationId: String!): Message
    notification: String
  }
`;
