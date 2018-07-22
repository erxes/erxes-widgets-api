import * as faker from 'faker';
import * as Random from 'meteor-random';
import { connect, disconnect } from '../db/connection';
import { conversationFactory, messageFactory } from '../db/factories';
import { Conversations, Messages } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Conversations related tests
 */
describe('Conversations', () => {
  let _conversation;

  beforeEach(async () => {
    // Creating test conversation
    _conversation = await conversationFactory();
  });

  afterEach(() => {
    // Clearing test data
    return Conversations.remove({}).then(() => Messages.remove({}));
  });

  test('createConversation() must return a new conversation', async () => {
    const now = new Date();

    const conversation = await Conversations.createConversation({
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      content: _conversation.content,
    });

    expect(conversation).toBeDefined();
    expect(conversation.integrationId).toBe(_conversation.integrationId);
    expect(conversation.customerId).toBe(_conversation.customerId);
    expect(conversation.content).toBe(_conversation.content);
    expect(conversation.createdAt >= now).toBe(true);
    expect(conversation.messageCount).toBe(0);
    expect(conversation.status).toBe(Conversations.getConversationStatuses().NEW);
    expect(conversation.number).toBe(2);
  });

  test('getOrCreateConversation() must return an existing conversation', async () => {
    const now = new Date();

    const conversation = await Conversations.getOrCreateConversation({
      conversationId: _conversation._id,
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      message: _conversation.content,
    });

    expect(conversation).toBeDefined();
    expect(conversation._id).toBe(_conversation._id);
    expect(conversation.createdAt < now).toBe(true);
    expect(conversation.status).toBe(Conversations.getConversationStatuses().OPEN);
    expect(conversation.readUserIds.length).toBe(0);
  });

  test('getOrCreateConversation() must return a new conversation', async () => {
    const now = new Date();

    const conversation = await Conversations.getOrCreateConversation({
      integrationId: _conversation.integrationId,
      customerId: _conversation.customerId,
      message: _conversation.content,
    });

    expect(conversation).toBeDefined();
    expect(conversation._id).not.toBe(_conversation._id);
    expect(conversation.createdAt >= now).toBe(true);
    expect(conversation.status).toBe(Conversations.getConversationStatuses().NEW);
    expect(conversation.messageCount).toBe(0);
    expect(conversation.content).toBe(_conversation.content);
    expect(conversation.readUserIds.length).toBe(0);
    expect(conversation.number).toBe(2);
  });

  test('createMessage() must return a new message', async () => {
    const now = new Date();

    const _message = {
      conversationId: _conversation._id,
      customerId: Random.id(),
      content: faker.lorem.sentence(),
    };

    const message = await Messages.createMessage(_message);

    const updatedConversation = await Conversations.findOne({
      _id: _message.conversationId,
    });

    expect(updatedConversation.updatedAt).toEqual(expect.any(Date));

    expect(message).toBeDefined();
    expect(message._id).toBeDefined();
    expect(message.createdAt >= now).toBeTruthy();
    expect(message.userId).toBeUndefined();
    expect(message.isCustomerRead).toBeUndefined();
    expect(message.internal).toBeFalsy();
  });

  test('forceReadCustomerPreviousEngageMessages', async () => {
    const customerId = '_id';

    // isCustomRead is defined ===============
    await messageFactory({
      customerId,
      engageData: { messageId: '_id' },
      isCustomerRead: false,
    });

    await Messages.forceReadCustomerPreviousEngageMessages(customerId);

    let messages = await Messages.find({
      customerId,
      engageData: { $exists: true },
      isCustomerRead: true,
    });

    expect(messages.length).toBe(1);

    // isCustomRead is undefined ===============
    await Messages.remove({});

    await messageFactory({
      customerId,
      engageData: { messageId: '_id' },
    });

    await Messages.forceReadCustomerPreviousEngageMessages(customerId);

    messages = await Messages.find({
      customerId,
      engageData: { $exists: true },
      isCustomerRead: true,
    });

    expect(messages.length).toBe(1);
  });
});
