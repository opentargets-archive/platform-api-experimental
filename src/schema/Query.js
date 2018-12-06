import { gql } from "apollo-server-express";

export const typeDefs = [
  gql`
    type Query {
      target(ensgId: String!): Target!
      disease(efoId: String!): Disease!
    }
  `,
];

export const resolvers = {
  Query: {
    target: (obj, { ensgId }) => ({ _ensgId: ensgId }),
    disease: (obj, { efoId }) => ({ _efoId: efoId }),
  },
};
