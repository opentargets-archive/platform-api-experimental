import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type ProteinInteractionsGraphNode {
    uniprotId: String!
    ensgId: String!
    symbol: String!
  }
  type ProteinInteractionsGraphEdge {
    source: String!
    target: String!
    isDirected: Boolean!
    isStimulation: Boolean!
    isInhibition: Boolean!
    pmIds: [String!]!
    sources: [String!]!
    pathwaysSources: [String!]!
    enzymeSubstrateSources: [String!]!
    ppiSources: [String!]!
  }
  type TargetDetailProteinInteractions {
    nodes: [ProteinInteractionsGraphNode!]!
    edges: [ProteinInteractionsGraphEdge!]!
  }
`;

export const resolvers = {
  TargetDetailProteinInteractions: {
    nodes: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ proteinInteractions }) => proteinInteractions.subGraph.nodes),
    edges: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ proteinInteractions }) => proteinInteractions.subGraph.edges),
  },
};
