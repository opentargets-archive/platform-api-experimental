import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TargetSummaryProteinInteractions {
    ppi: Int!
    pathways: Int!
    enzymeSubstrate: Int!
    interactorsCount: Int!
    sources: [Source!]!
  }
`;

export const resolvers = {
  TargetSummaryProteinInteractions: {
    ppi: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ proteinInteractions }) => proteinInteractions.counts.ppi),
    pathways: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ proteinInteractions }) => proteinInteractions.counts.pathways),
    enzymeSubstrate: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(
          ({ proteinInteractions }) =>
            proteinInteractions.counts.enzymeSubstrate
        ),
    interactorsCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ proteinInteractions }) =>
          proteinInteractions.subGraph.nodes.length > 0
            ? proteinInteractions.subGraph.nodes.length - 1
            : 0
        ),
    sources: () => [{ name: 'OmniPath DB', url: 'http://omnipathdb.org/' }],
  },
};
