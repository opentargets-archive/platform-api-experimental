import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TargetSummaryProteinInteractions {
    ppi: Int!
    pathways: Int!
    enzymeSubstrate: Int!
    sources: [Source!]!
  }
`;

export const resolvers = {
  TargetSummaryProteinInteractions: {
    ppi: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ proteinInteractions }) => proteinInteractions.ppi),
    pathways: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ proteinInteractions }) => proteinInteractions.pathways),
    enzymeSubstrate: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ proteinInteractions }) => proteinInteractions.enzymeSubstrate),
    sources: () => [{ name: 'OmniPath DB', url: 'http://omnipathdb.org/' }],
  },
};
