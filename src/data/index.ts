import { makeExecutableSchema } from "graphql-tools";
import resolvers from "./resolvers";
import { mutations, queries, types } from "./schema";

export default makeExecutableSchema({
  typeDefs: [types, queries, mutations],
  resolvers
});
