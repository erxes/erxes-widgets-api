export const types = `
  scalar Date
  scalar JSON

  type Company {
    _id: String!
    name: String
    size: Int
    website: String
    industry: String
    plan: String
    lastSeenAt: Date
    sessionCount: Int
    tagIds: [String],
  }

  type UserDetails {
    avatar: String
    shortName: String
    position: String
    location: String
    description: String
    fullName: String
  }

  type UserLinks {
    facebook: String
    twitter: String
    youtube: String
    linkedIn: String
    github: String
    website: String
  }

  type User {
    _id: String!
    details: UserDetails
    links: UserLinks
  }

  type Customer {
    _id: String!
    location: JSON
  }

  type EngageData {
    messageId: String
    brandId: String
    content: String
    fromUserId: String
    fromUser: User
    kind: String
    sentAs: String
  }

  type Integration {
    _id: String!
    name: String
    languageCode: String
    uiOptions: JSON
    messengerData: JSON
    formData: JSON
  }

  type Brand {
    name: String!
    code: String!
    description: String
  }

  type Attachment {
    url: String!
    name: String!
    type: String!
    size: Float
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
    fromBot: Boolean
    engageData: EngageData
    messengerAppData: JSON
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

  type Rule {
    _id : String!
    kind: String!
    text: String!
    condition: String!
    value: String
  }

  type Form {
    _id: String
    title: String
    description: String
    buttonText: String
    themeColor: String
    callout: JSON
    fields: [Field]
    rules: [Rule]
  }

  type MessengerConnectResponse {
    integrationId: String
    uiOptions: JSON
    languageCode: String
    messengerData: JSON
    customerId: String
    brand: Brand
  }

  type ConversationDetailResponse {
    _id: String
    messages: [ConversationMessage]
    participatedUsers: [User]
    isOnline: Boolean
    supporters: [User]
  }

  type FormConnectResponse {
    integration: Integration
    form: Form
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
    reactionChoices: [String]
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
    color: String
    backgroundImage: String
    languageCode: String
  }

  type KnowledgeBaseLoader {
    loadType: String
  }

  type Deal {
    _id: String!
    name: String!
    stageId: String!
    boardId: String
    companyIds: [String]
    customerIds: [String]
    assignedUserIds: [String]
    amount: JSON
    closeDate: Date
    description: String
    productsData: JSON
    modifiedAt: Date
    modifiedBy: String
    order: Int
    createdAt: Date
  }

  input AttachmentInput {
    url: String!
    name: String!
    type: String!
    size: Float
  }

  input DealInput {
    name: String!
    stageName: String!
    boardName: String!
    pipelineName: String
    userEmail: String!
    companyIds: [String]
    customerEmail: String
    description: String
    productsData: DealProductInput!
  }

  input DealProductInput {
    productName: String!
    uom: String!
    currency: String!
    quantity: Int!
    unitPrice: Int!
    taxPercent: Int
    tax: Int
    discountPercent: Int
    discount: Int
    amount: Int
  }

  input FieldValueInput {
    _id: String!
    type: String
    validation: String
    text: String
    value: String
  }
`;

export const queries = `
  type Query {
    conversations(integrationId: String!, customerId: String!): [Conversation]
    conversationDetail(_id: String, integrationId: String!): ConversationDetailResponse
    getMessengerIntegration(brandCode: String!): Integration
    messages(conversationId: String): [ConversationMessage]
    unreadCount(conversationId: String): Int
    totalUnreadCount(integrationId: String!, customerId: String!): Int
    messengerSupporters(integrationId: String!): [User]
    form(formId: String): Form
    knowledgeBaseTopicsDetail(topicId: String!) : KnowledgeBaseTopic
    knowledgeBaseCategoriesDetail(categoryId: String!) : KnowledgeBaseCategory
    knowledgeBaseArticles(topicId: String!, searchString: String) : [KnowledgeBaseArticle]
    knowledgeBaseLoader(topicId: String!) : KnowledgeBaseLoader
  }
`;

export const mutations = `
  type Mutation {
    messengerConnect(
      brandCode: String!
      email: String
      phone: String
      isUser: Boolean

      companyData: JSON
      data: JSON

      cachedCustomerId: String
      deviceToken: String
    ): MessengerConnectResponse

    saveBrowserInfo(
      customerId: String!
      browserInfo: JSON!
    ): ConversationMessage

    insertMessage(
      integrationId: String!
      customerId: String!
      conversationId: String
      message: String,
      attachments: [AttachmentInput]
    ): ConversationMessage

    readConversationMessages(conversationId: String): JSON
    saveCustomerGetNotified(customerId: String!, type: String!, value: String!): JSON

    formConnect(
      brandCode: String!,
      formCode: String!
    ): FormConnectResponse

    saveForm(
      integrationId: String!
      formId: String!
      submissions: [FieldValueInput]
      browserInfo: JSON!
    ): SaveFormResponse

    sendEmail(
      toEmails: [String]
      fromEmail: String
      title: String
      content: String
    ): String

    knowledgebaseIncReactionCount(articleId: String!, reactionChoice: String!): String
    formIncreaseViewCount(formId: String!): JSON
    sendTypingInfo(conversationId: String!, text: String): String
    sendEvent(type: String, dealDoc: DealInput): JSON
  }
`;

const typeDefs = [types, queries, mutations];

export default typeDefs;
