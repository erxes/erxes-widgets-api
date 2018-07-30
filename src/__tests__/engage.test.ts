import {
  createEngageVisitorMessages,
  createOrUpdateConversationAndMessages,
  replaceKeys
} from "../data/resolvers/utils/engage";

import {
  brandFactory,
  customerFactory,
  engageDataFactory,
  integrationFactory,
  messageFactory,
  userFactory
} from "../db/factories";

import { connect, disconnect } from "../db/connection";

import {
  Brands,
  Conversations,
  Customers,
  EngageMessages,
  IBrandDocument,
  ICustomerDocument,
  IIntegrationDocument,
  Integrations,
  IUserDocument,
  Messages
} from "../db/models";

beforeAll(() => connect());

afterAll(() => disconnect());

describe("replace keys", () => {
  test("must replace customer, user placeholders", async () => {
    const customer = await customerFactory({
      firstName: "firstName",
      lastName: "lastName"
    });
    const user = await userFactory({ fullName: "fullName" });

    const response = replaceKeys({
      content: "hi {{ customer.name }} - {{ user.fullName }}",
      customer,
      user
    });

    expect(response).toBe("hi firstName lastName - fullName");
  });
});

describe("createConversation", () => {
  let _customer: ICustomerDocument;
  let _integration: IIntegrationDocument;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory();
    _integration = await integrationFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.remove({});
    await Integrations.remove({});
    await Conversations.remove({});
    await Messages.remove({});
  });

  test("createOrUpdateConversationAndMessages", async () => {
    const user = await userFactory({ fullName: "Full name" });

    const kwargs = {
      customer: _customer,
      integration: _integration,
      user,
      engageData: engageDataFactory({
        content: "hi {{ customer.name }} {{ user.fullName }}",
        messageId: "_id"
      })
    };

    // create ==========================
    const message = await createOrUpdateConversationAndMessages(kwargs);

    if (!message) {
      throw new Error("message is null");
    }

    const conversation = await Conversations.findOne({
      _id: message.conversationId
    });

    if (!conversation) {
      throw new Error("conversation not found");
    }

    expect(await Conversations.find().count()).toBe(1);
    expect(await Messages.find().count()).toBe(1);

    const customerName = `${_customer.firstName} ${_customer.lastName}`;

    // check message fields
    expect(message._id).toBeDefined();
    expect(message.content).toBe(`hi ${customerName} Full name`);
    expect(message.userId).toBe(user._id);
    expect(message.customerId).toBe(_customer._id);

    // check conversation fields
    expect(conversation._id).toBeDefined();
    expect(conversation.content).toBe(`hi ${customerName} Full name`);
    expect(conversation.integrationId).toBe(_integration._id);

    // second time ==========================
    // must not create new conversation & messages update
    await Messages.update(
      { conversationId: conversation._id },
      { $set: { isCustomerRead: true } }
    );

    let response = await createOrUpdateConversationAndMessages(kwargs);

    expect(response).toBe(null);

    expect(await Conversations.find().count()).toBe(1);
    expect(await Messages.find().count()).toBe(1);

    const updatedMessage = await Messages.findOne({
      conversationId: conversation._id
    });

    if (!updatedMessage) {
      throw new Error("message not found");
    }

    expect(updatedMessage.isCustomerRead).toBe(false);

    // do not mark as unread for conversations that
    // have more than one messages =====================
    await Messages.update(
      { conversationId: conversation._id },
      { $set: { isCustomerRead: true } }
    );

    await messageFactory({
      conversationId: conversation._id,
      isCustomerRead: true
    });

    response = await createOrUpdateConversationAndMessages(kwargs);

    expect(response).toBe(null);

    expect(await Conversations.find().count()).toBe(1);
    expect(await Messages.find().count()).toBe(2);

    const [message1, message2] = await Messages.find({
      conversationId: conversation._id
    });

    expect(message1.isCustomerRead).toBe(true);
    expect(message2.isCustomerRead).toBe(true);
  });
});

describe("createEngageVisitorMessages", () => {
  let _user: IUserDocument;
  let _brand: IBrandDocument;
  let _customer: ICustomerDocument;
  let _integration: IIntegrationDocument;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory({
      urlVisits: { "/page": 11 }
    });

    _brand = await brandFactory({});
    _integration = await integrationFactory({ brandId: _brand._id });
    _user = await userFactory({});

    const message = new EngageMessages({
      title: "Visitor",
      fromUserId: _user._id,
      kind: "visitorAuto",
      method: "messenger",
      isLive: true,
      messenger: {
        brandId: _brand._id,
        rules: [
          {
            kind: "currentPageUrl",
            condition: "is",
            value: "/page"
          },
          {
            kind: "numberOfVisits",
            condition: "greaterThan",
            value: 10
          }
        ],
        content: "hi {{ customer.name }}"
      }
    });

    return message.save();
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.remove({});
    await Integrations.remove({});
    await Conversations.remove({});
    await Messages.remove({});
    await Brands.remove({});
  });

  test("must create conversation & message object", async () => {
    // previous unread conversation messages created by engage
    await messageFactory({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: engageDataFactory({
        messageId: "_id2"
      })
    });

    await messageFactory({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: engageDataFactory({
        messageId: "_id2"
      })
    });

    // main call
    await createEngageVisitorMessages({
      brand: _brand,
      customer: _customer,
      integration: _integration,
      browserInfo: {
        url: "/page"
      }
    });

    const conversation = await Conversations.findOne({});

    if (!conversation) {
      throw new Error("conversation not found");
    }

    const content = `hi ${_customer.firstName} ${_customer.lastName}`;

    expect(conversation._id).toBeDefined();
    expect(conversation.content).toBe(content);
    expect(conversation.customerId).toBe(_customer._id);
    expect(conversation.integrationId).toBe(_integration._id);

    const message = await Messages.findOne({
      conversationId: conversation._id
    });

    if (!message) {
      throw new Error("message not found");
    }

    expect(message._id).toBeDefined();
    expect(message.content).toBe(content);

    // count of unread conversation messages created by engage must be zero
    const convEngageMessages = await Messages.find({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: { $exists: true }
    });

    expect(convEngageMessages.length).toBe(0);
  });
});
