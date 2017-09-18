import customScalars from './customScalars';
import Query from './queries';
import Mutation from './mutations';
import Conversation from './conversation';
import Message from './message';
import Field from './field';
import Engage from './engage';

export default {
  ...customScalars,

  Conversation,
  Message,
  Field,

  EngageData: {
    ...Engage,
  },

  Query,
  Mutation,
};
