/* eslint-disable new-cap */

import mongoose from 'mongoose';
import Random from 'meteor-random';

export const connectToMongo = () => {
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGO_URL, {
    server: {
      // after server reload, user must not reload widget manually
      auto_reconnect: true,
    },
  });
};

const UserSchema = mongoose.Schema({
  _id: String,
  details: {
    avatar: String,
    fullName: String,
  },
});

const BrandSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  code: String,
});

const IntegrationSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  name: String,
  brandId: String,
  formId: String,
  kind: String,
  formData: Object,
  messengerData: Object,
  uiOptions: Object,
});

const CustomerSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  integrationId: String,
  email: String,
  isUser: Boolean,
  name: String,
  createdAt: Date,
  messengerData: Object,
});

const ConversationSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  createdAt: Date,
  content: String,
  customerId: String,
  integrationId: String,
  number: Number,
  messageCount: Number,
  status: String,
  readUserIds: [String],
  participatedUserIds: [String],
});

const AttachmentSchema = mongoose.Schema({
  url: String,
  name: String,
  size: Number,
  type: String,
});

const MessageSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  userId: String,
  conversationId: String,
  customerId: String,
  content: String,
  attachments: [AttachmentSchema],
  createdAt: Date,
  isCustomerRead: Boolean,
  internal: Boolean,
  formWidgetData: Object,
});

const FormSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  title: String,
  code: String,
});

const FormFieldSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  formId: String,
  type: String,
  validation: String,
  check: String,
  text: String,
  description: String,
  options: [String],
  isRequired: Boolean,
  order: Number,
});

const Users = mongoose.model('users', UserSchema);
const Brands = mongoose.model('brands', BrandSchema);
const Integrations = mongoose.model('integrations', IntegrationSchema);
const Customers = mongoose.model('customers', CustomerSchema);
const Conversations = mongoose.model('conversations', ConversationSchema);
const Messages = mongoose.model('conversation_messages', MessageSchema);
const Forms = mongoose.model('forms', FormSchema);
const FormFields = mongoose.model('form_fields', FormFieldSchema);

export { Users, Brands, Integrations, Customers, Conversations, Messages, Forms, FormFields };
