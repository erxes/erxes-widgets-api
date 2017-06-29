import customTypes from './custom-types';
import Query from './queries';
import Mutation from './mutations';
import Subscription from './subscriptions';
import Conversation from './conversation';
import Message from './message';
import Field from './field';

export default {
  ...customTypes,

  Conversation,
  Message,
  Field,

  Query,
  Mutation,
  Subscription,
};
