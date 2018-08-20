import * as faker from "faker";
import * as Random from "meteor-random";

import {
  Brands,
  Companies,
  Configs,
  Conversations,
  Customers,
  DealBoards,
  DealPipelines,
  DealProducts,
  Deals,
  DealStages,
  Fields,
  Forms,
  IMessageEngageData,
  Integrations,
  Messages,
  Users
} from "./models";

interface IUserParams {
  fullName?: string;
  email?: string;
}
export const userFactory = (params: IUserParams = {}) => {
  const user = new Users({
    details: {
      fullName: params.fullName || faker.random.word()
    },
    email: params.email || faker.internet.email()
  });

  return user.save();
};

interface IBrandParams {
  name?: string;
  code?: string;
}
export const brandFactory = (params: IBrandParams = {}) => {
  const brand = new Brands({
    name: params.name || faker.random.word(),
    code: params.code || faker.random.word(),
    userId: Random.id()
  });

  return brand.save();
};

interface IIntegrationParams {
  kind?: string;
  brandId?: string;
  formId?: string;
  messengerData?: any;
}
export const integrationFactory = (params: IIntegrationParams = {}) => {
  const integration = new Integrations({
    name: faker.random.word(),
    kind: params.kind || "messenger",
    brandId: params.brandId || Random.id(),
    formId: params.formId || Random.id(),
    messengerData: params.messengerData
  });

  return integration.save();
};

interface IFormParams {
  title?: string;
  code?: string;
}
export const formFactory = (params: IFormParams = {}) => {
  const form = new Forms({
    title: params.title || faker.random.word(),
    code: params.code || Random.id()
  });

  return form.save();
};

interface IFormFieldParams {
  contentTypeId?: string;
  type?: string;
  validation?: string;
  isRequired?: boolean;
}
export const formFieldFactory = (params: IFormFieldParams = {}) => {
  const field = new Fields({
    contentType: "form",
    contentTypeId: params.contentTypeId || Random.id(),
    type: params.type || faker.random.word(),
    name: faker.random.word(),
    validation: params.validation || faker.random.word(),
    text: faker.random.word(),
    description: faker.random.word(),
    isRequired: params.isRequired || false,
    number: faker.random.word()
  });

  return field.save();
};

interface ICustomerParams {
  integrationId?: string;
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  emails?: string[];
  phones?: string[];
  primaryPhone?: string;
  isActive?: boolean;
  urlVisits?: object;
}
export function customerFactory(params: ICustomerParams = {}) {
  const createdAt = faker.date.past();
  const email = faker.internet.email();

  const customer = new Customers({
    integrationId: params.integrationId || Random.id(),
    createdAt,

    firstName: params.firstName,
    lastName: params.lastName,

    primaryEmail: params.primaryEmail || email,
    emails: params.emails || [email],

    primaryPhone: params.primaryPhone || "244244",
    phones: params.phones || ["244244"],

    isUser: faker.random.boolean(),
    name: faker.name.findName(),
    messengerData: {
      lastSeenAt: faker.date.between(createdAt, new Date()),
      isActive: params.isActive || false,
      sessionCount: faker.random.number()
    },
    urlVisits: params.urlVisits
  });

  return customer.save();
}

export function conversationFactory() {
  const conversation = new Conversations({
    createdAt: faker.date.past(),
    content: faker.lorem.sentence,
    customerId: Random.id(),
    integrationId: Random.id(),
    number: 1,
    messageCount: 0,
    status: Conversations.getConversationStatuses().NEW
  });

  return conversation.save();
}

interface IConversationMessageParams {
  customerId?: string;
  conversationId?: string;
  engageData?: IMessageEngageData;
  isCustomerRead?: boolean;
}
export function messageFactory(params: IConversationMessageParams = {}) {
  const message = new Messages({
    userId: Random.id(),
    conversationId: Random.id(),
    customerId: Random.id(),
    content: faker.lorem.sentence,
    createdAt: faker.date.past(),
    isCustomerRead: params.isCustomerRead,
    engageData: params.engageData,
    ...params
  });

  return message.save();
}

interface ICompanyParams {
  primaryName?: string;
  names?: string[];
}
export function companyFactory(params: ICompanyParams = {}) {
  const company = new Companies({
    primaryName: params.primaryName || faker.lorem.sentence,
    names: params.names || [faker.lorem.sentence],
    lastSeenAt: faker.date.past(),
    sessionCount: faker.random.number()
  });

  return company.save();
}

interface IMessageEngageDataParams {
  messageId?: string;
  brandId?: string;
  content?: string;
  fromUserId?: string;
  kind?: string;
  sentAs?: string;
}
export function engageDataFactory(params: IMessageEngageDataParams) {
  return {
    messageId: params.messageId || Random.id(),
    brandId: params.brandId || Random.id(),
    content: params.content || faker.lorem.sentence(),
    fromUserId: params.fromUserId || Random.id(),
    kind: params.kind || "popup",
    sentAs: params.sentAs || "post"
  };
}

interface IProductDataInput {
  productName?: string;
  uom?: string;
  currency?: string;
  quantity?: number;
  unitPrice?: number;
  taxPercent?: number;
  tax?: number;
  discountPercent?: number;
  discount?: number;
  amount?: number;
}

interface IDealInput {
  name?: string;
  stageId?: string;
  companyIds?: string[];
  customerIds?: string[];
  description?: string;
  productsData?: IProductDataInput;
}

export function dealFactory(params: IDealInput) {
  return Deals.create({
    name: params.name || faker.random.word(),
    stageId: params.stageId || Random.id(),
    companyIds: params.companyIds || [Random.id()],
    customerIds: params.customerIds || [Random.id()],
    description: params.description || faker.random.word(),
    productsData: params.productsData || {}
  });
}

interface IDealProductInput {
  name?: string;
  type?: string;
  description?: string;
  sku?: string;
}

export function dealProductFactory(params: IDealProductInput) {
  return DealProducts.create({
    name: params.name || faker.random.word(),
    type: params.type || "product",
    description: params.description || faker.random.word(),
    sku: params.sku || faker.random.word()
  });
}

interface IDealBoardInput {
  name?: string;
  isDefault?: boolean;
}

export function dealBoardFactory(params: IDealBoardInput) {
  return DealBoards.create({
    name: params.name || faker.random.word(),
    isDefault: params.isDefault || false
  });
}

interface IDealStageInput {
  name?: string;
  probability?: string;
  pipelineId?: string;
}

export function dealStageFactory(params: IDealStageInput) {
  return DealStages.create({
    name: params.name || faker.random.word(),
    probability: params.probability || "10%",
    pipelineId: params.pipelineId || Random.id()
  });
}

interface IDealPipelineInput {
  name?: string;
  boardId?: string;
}

export function dealPipelineFactory(params: IDealPipelineInput) {
  return DealPipelines.create({
    name: params.name || faker.random.word(),
    boardId: params.boardId || Random.id()
  });
}

interface IConfigInput {
  code?: string;
  value: string[];
}

export function configFactory(params: IConfigInput) {
  return Configs.create({
    code: params.code || faker.random.word(),
    value: params.value || [faker.random.word()]
  });
}
