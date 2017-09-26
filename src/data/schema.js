export const types = `
  scalar Date
  scalar JSON

  type EngageData {
    messageId: String
    brandId: String
    content: String
    fromUserId: String
    fromUser: User
    kind: String
    sentAs: String
  }

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

    messages: [ConversationMessage]
  }

  type ConversationMessage {
    _id: String!
    conversationId: String!
    customerId: String
    user: User
    content: String
    createdAt: Date
    attachments: [Attachment]
    internal: Boolean
    engageData: EngageData
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
    integrationId: String
    uiOptions: JSON
    messengerData: JSON
    customerId: String
  }

  type EndConversationResponse {
    customerId: String!
  }

  type FormConnectResponse {
    integrationId: String!
    integrationName: String!
    formId: String!
    formData: JSON!
  }

  type SaveFormResponse {
    status: String!
    errors: [Error]
    messageId: String
  }

  type Error {
    fieldId: String
    code: String
    text: String
  }

  type KnowledgeBaseArticle {
    _id: String
    title: String
    summary: String
    content: String
    createdBy: String
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
    author: User
  }

  type KnowledgeBaseCategory {
    _id: String
    title: String
    description: String
    articles: [KnowledgeBaseArticle]
    numOfArticles: Int
    authors: [User]
    icon: String
  }

  type KnowledgeBaseTopic {
    _id: String
    title: String
    description: String
    categories: [KnowledgeBaseCategory]
  }

  type KnowledgeBaseLoader {
    loadType: String
  }
`;

export const queries = `
  type Query {
    conversations(integrationId: String!, customerId: String!): [Conversation]
    conversationDetail(_id: String!): Conversation
    getMessengerIntegration(brandCode: String!): Integration
    lastUnreadMessage(integrationId: String!, customerId: String!): ConversationMessage
    totalUnreadCount(integrationId: String!, customerId: String!): Int
    messages(conversationId: String): [ConversationMessage]
    unreadCount(conversationId: String): Int
    conversationLastStaff(_id: String): User
    isMessengerOnline(integrationId: String!): Boolean
    form(formId: String): Form
    knowledgeBaseTopicsDetail(topicId: String!) : KnowledgeBaseTopic
    knowledgeBaseCategoriesDetail(categoryId: String!) : KnowledgeBaseCategory
    knowledgeBaseArticles(topicId: String!, searchString: String) : [KnowledgeBaseArticle]
    knowledgeBaseLoader(topicId: String!) : KnowledgeBaseLoader
  }
`;

export const mutations = `
  type Mutation {
    endConversation(brandCode: String!, data: JSON): EndConversationResponse

    messengerConnect(
      brandCode: String!,
      email: String,
      phone: String,
      name: String,
      isUser: Boolean,
      data: JSON,
      browserInfo: JSON,
      cachedCustomerId: String
    ): MessengerConnectResponse

    insertMessage(
      integrationId: String!,
      customerId: String!,
      conversationId: String!,
      message: String,
      attachments: [AttachmentInput]
    ): ConversationMessage

    readConversationMessages(conversationId: String): String
    readEngageMessage(messageId: String!, customerId: String!): String
    saveCustomerGetNotified(customerId: String!, type: String!, value: String!): String
    formConnect(brandCode: String!, formCode: String!): FormConnectResponse

    saveForm(
      integrationId: String!,
      formId: String!,
      submissions: [FieldValueInput]
    ): SaveFormResponse

    sendEmail(toEmails: [String], fromEmail: String, title: String, content: String): String
  }
`;
