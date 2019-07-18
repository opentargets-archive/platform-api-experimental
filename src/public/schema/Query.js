import { gql } from 'apollo-server-express';

export const typeDefs = [
  gql`
    type Query {
      target(ensgId: String!): Target!
      disease(efoId: String!): Disease!
      drug(chemblId: String!): Drug!
      evidence(ensgId: String!, efoId: String!, from: Int, size: Int): Evidence!
    }
  `,
];

export const resolvers = {
  Query: {
    target: (obj, { ensgId }) => ({ _ensgId: ensgId }),
    disease: (obj, { efoId }) => ({ _efoId: efoId }),
    drug: (obj, { chemblId }) => ({ _chemblId: chemblId }),
    evidence: (obj, { ensgId, efoId, from, size }) => ({
      _ensgId: ensgId,
      _efoId: efoId,
      _from: from,
      _size: size,
    }),
  },
};
