import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import { types, queries, mutations } from './schema';

export default makeExecutableSchema({
  typeDefs: [types, queries, mutations],
  resolvers,
});
