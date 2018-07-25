// TODO: resolve below
const faker: any = require('faker');
const Random: any = require('meteor-random');

import {
  Integrations,
  Brands,
  Forms,
  Fields,
  Customers,
  Conversations,
  Messages,
  Users,
  Companies,
  IMessageEngageData,
} from './models';

interface IUserParams {
  fullName?: string,
}
export const userFactory = (params: IUserParams={}) => {
  const user = new Users({
    details: {
      fullName: params.fullName || faker.random.word(),
    },
  });

  return user.save();
};

interface IBrandParams {
  name?: string,
  code?: string,
}
export const brandFactory = (params: IBrandParams={}) => {
  const brand = new Brands({
    name: params.name || faker.random.word(),
    code: params.code || faker.random.word(),
    userId: Random.id(),
  });

  return brand.save();
};

interface IIntegrationParams {
  kind?: string,
  brandId?: string,
  formId?: string,
  messengerData?: any,
}
export const integrationFactory = (params: IIntegrationParams={}) => {
  const integration = new Integrations({
    name: faker.random.word(),
    kind: params.kind || 'messenger',
    brandId: params.brandId || Random.id(),
    formId: params.formId || Random.id(),
    messengerData: params.messengerData,
  });

  return integration.save();
};

interface IFormParams {
  title?: string,
  code?: string,
}
export const formFactory = (params: IFormParams={}) => {
  const form = new Forms({
    title: params.title || faker.random.word(),
    code: params.code || Random.id(),
  });

  return form.save();
};

interface IFormFieldParams {
  contentTypeId?: string,
  type?: string,
  validation?: string,
  isRequired?: boolean,
}
export const formFieldFactory = (params: IFormFieldParams={}) => {
  const field = new Fields({
    contentType: 'form',
    contentTypeId: params.contentTypeId || Random.id(),
    type: params.type || faker.random.word(),
    name: faker.random.word(),
    validation: params.validation || faker.random.word(),
    text: faker.random.word(),
    description: faker.random.word(),
    isRequired: params.isRequired || false,
    number: faker.random.word(),
  });

  return field.save();
};

interface ICustomerParams {
  integrationId?: string,
  firstName?: string,
  lastName?: string,
  primaryEmail?: string,
  emails?: string[],
  phones?: string[],
  primaryPhone?: string,
  isActive?: boolean,
  urlVisits?: object,
}
export function customerFactory(params: ICustomerParams={}) {
  const createdAt = faker.date.past();
  const email = faker.internet.email();

  const customer = new Customers({
    integrationId: params.integrationId || Random.id(),
    createdAt,

    firstName: params.firstName,
    lastName: params.lastName,

    primaryEmail: params.primaryEmail || email,
    emails: params.emails || [email],

    primaryPhone: params.primaryPhone || '244244',
    phones: params.phones || ['244244'],

    isUser: faker.random.boolean(),
    name: faker.name.findName(),
    messengerData: {
      lastSeenAt: faker.date.between(createdAt, new Date()),
      isActive: params.isActive || false,
      sessionCount: faker.random.number(),
    },
    urlVisits: params.urlVisits,
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
    status: Conversations.getConversationStatuses().NEW,
  });

  return conversation.save();
}

interface IConversationMessageParams {
  customerId?: string,
  conversationId?: string,
  engageData?: IMessageEngageData,
  isCustomerRead?: boolean,
}
export function messageFactory(params: IConversationMessageParams={}) {
  const message = new Messages({
    userId: Random.id(),
    conversationId: Random.id(),
    customerId: Random.id(),
    content: faker.lorem.sentence,
    createdAt: faker.date.past(),
    isCustomerRead: params.isCustomerRead,
    engageData: params.engageData,
    ...params,
  });

  return message.save();
}

interface ICompanyParams {
  primaryName?: string,
  names?: string[],
}
export function companyFactory(params: ICompanyParams={}) {
  const company = new Companies({
    primaryName: params.primaryName || faker.lorem.sentence,
    names: params.names || [faker.lorem.sentence],
    lastSeenAt: faker.date.past(),
    sessionCount: faker.random.number(),
  });

  return company.save();
}

interface IMessageEngageDataParams {
  messageId?: string,
  brandId?: string,
  content?: string,
  fromUserId?: string,
  kind?: string,
  sentAs?: string,
}
export function engageDataFactory(params: IMessageEngageDataParams) {
  return {
    messageId: params.messageId || Random.id(),
    brandId: params.brandId || Random.id(),
    content: params.content || faker.lorem.sentence(),
    fromUserId: params.fromUserId || Random.id(),
    kind: params.kind || 'popup',
    sentAs: params.sentAs || 'post'
  }
}
