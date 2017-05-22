import { makeExecutableSchema } from 'graphql-tools';
import messengerQueries from './messenger-queries';
import formQueries from './form-queries';
import messengerMutations from './messenger-mutations';
import FormMutations from './form-mutations';
import subscriptions from './subscriptions';
import customTypes from './custom-types';

const typeDefs = `
  scalar Date
  scalar JSON

  # user ================
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
    text: String
    value: String
  }

  type Integration {
    _id: String!
    uiOptions: JSON
    messengerData: JSON
  }

  # conversation ===========
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

  # the schema allows the following queries:
  type RootQuery {
    conversations(integrationId: String!, customerId: String!): [Conversation]
    getMessengerIntegration(brandCode: String!): Integration
    totalUnreadCount(integrationId: String!, customerId: String!): Int
    messages(conversationId: String): [Message]
    unreadCount(conversationId: String): Int
    conversationLastStaff(_id: String): User
    isMessengerOnline(integrationId: String!): Boolean

    # form =====
    form(formId: String): Form
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

  type Mutation {
    messengerConnect(brandCode: String!, email: String!, name: String,
      isUser: Boolean, data: JSON): MessengerConnectResponse

    insertMessage(integrationId: String!, customerId: String!,
      conversationId: String!, message: String,
      attachments: [AttachmentInput]): Message

    simulateInsertMessage(messageId: String): Message

    readConversationMessages(conversationId: String): String

    formConnect(brandCode: String!, formCode: String!): FormConnectResponse

    saveForm(integrationId: String!, formId: String!,
      submissions: [FieldValueInput]): [Error]

    sendEmail(toEmails: [String], fromEmail: String,
      title: String, content: String): String
  }

  # subscriptions
  type Subscription {
    messageInserted(conversationId: String!): Message
    notification: String
  }

  # we need to tell the server which types represent the root query
  # and root mutation types. We call them RootQuery and RootMutation by convention.
  schema {
    query: RootQuery
    subscription: Subscription
    mutation: Mutation
  }
`;

const resolvers = {
  ...customTypes,
  RootQuery: {
    ...messengerQueries,
    ...formQueries,
  },
  ...subscriptions,
  Mutation: {
    ...messengerMutations,
    ...FormMutations,
  },
};

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default executableSchema;
