import { gql } from "apollo-server-express";

export const typeDef = gql`
  # extend type Query {
  #   target: Target!
  # }
  type Target {
    id: String!
    symbol: String!
    name: String!
    description: String
    synonyms: [String!]!
  }
`;

export const resolvers = {
  // Query: {
  //   target: () => ({}),
  // },
  Target: {
    id: (obj, args, { ensgId, targetLoader }) =>
      targetLoader.load(ensgId).then(({ id }) => id),
    symbol: (obj, args, { ensgId, targetLoader }) =>
      targetLoader.load(ensgId).then(({ symbol }) => symbol),
    name: (obj, args, { ensgId, targetLoader }) =>
      targetLoader.load(ensgId).then(({ name }) => name),
    description: (obj, args, { ensgId, targetLoader }) =>
      targetLoader.load(ensgId).then(({ description }) => description),
    synonyms: (obj, args, { ensgId, targetLoader }) =>
      targetLoader.load(ensgId).then(({ synonyms }) => synonyms),
  },
};
