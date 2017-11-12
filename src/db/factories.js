import Random from 'meteor-random';
import faker from 'faker';
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
} from './models';

export const userFactory = (params = {}) => {
  const user = new Users({
    details: {
      fullName: params.fullName || faker.random.word(),
    },
  });

  return user.save();
};

export const brandFactory = (params = {}) => {
  const brand = new Brands({
    name: faker.random.word(),
    code: params.code || faker.random.word(),
    userId: Random.id(),
  });

  return brand.save();
};

export const integrationFactory = params => {
  const integration = new Integrations({
    name: faker.random.word(),
    kind: params.kind || 'messenger',
    brandId: params.brandId || Random.id(),
    formId: params.formId || Random.id(),
  });

  return integration.save();
};

export const formFactory = ({ title, code }) => {
  const form = new Forms({
    title: title || faker.random.word(),
    code: code || Random.id(),
  });

  return form.save();
};

export const formFieldFactory = params => {
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

export function customerFactory(params = {}) {
  const createdAt = faker.date.past();
  const customer = new Customers({
    integrationId: params.integrationId || Random.id(),
    createdAt,
    email: faker.internet.email(),
    isUser: faker.random.boolean(),
    name: faker.name.findName(),
    messengerData: {
      lastSeenAt: faker.date.between(createdAt, new Date()),
      isActive: params.isActive || false,
      sessionCount: faker.random.number(),
    },
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

export function messageFactory(params = {}) {
  const obj = Object.assign(
    {
      userId: Random.id(),
      conversationId: Random.id(),
      customerId: Random.id(),
      content: faker.lorem.sentence,
      createdAt: faker.date.past(),
    },
    params,
  );
  const message = new Messages(obj);

  return message.save();
}

export function companyFactory() {
  const company = new Companies({
    name: faker.lorem.sentence,
    lastSeenAt: faker.date.past(),
    sessionCount: faker.random.number(),
  });

  return company.save();
}
