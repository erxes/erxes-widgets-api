import customTypes from './custom-types';
import messengerQueries from './messenger-queries';
import formQueries from './form-queries';
import messengerMutations from './messenger-mutations';
import FormMutations from './form-mutations';
import subscriptions from './subscriptions';

export default {
  ...customTypes,
  Query: {
    ...messengerQueries,
    ...formQueries,
  },
  Mutation: {
    ...messengerMutations,
    ...FormMutations,
  },
  ...subscriptions,
};
