import customScalars from './customScalars';
import Query from './queries';
import Mutation from './mutations';
import Subscription from './subscriptions';
import Conversation from './conversation';
import Message from './message';
import Field from './field';

export default {
  ...customScalars,

  Conversation,
  Message,
  Field,

  Query,
  Mutation,
  Subscription,
};
