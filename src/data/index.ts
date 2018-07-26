import { makeExecutableSchema } from "graphql-tools";
import resolvers from "./resolvers";
import { mutations, queries, types } from "./schema";

// TODO: check in strict mode
export default makeExecutableSchema({
  typeDefs: [types, queries, mutations],
  resolvers
});
