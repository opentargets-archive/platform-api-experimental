import { gql } from "apollo-server-express";

import { homologyTable } from "../../apis/ensembl";

export const typeDefs = gql`
  type HomologyRow {
    dNdS: Float
    species: String!
    queryPercentageIdentity: Float!
    targetPercentageIdentity: Float!
    targetGeneId: String!
    targetGeneSymbol: String!
  }
  type TargetDetailHomology {
    rows: [HomologyRow!]!
  }
`;

export const resolvers = {
  TargetDetailHomology: {
    rows: ({ _ensgId }, args, { targetLoader }) => homologyTable(_ensgId),
  },
};
