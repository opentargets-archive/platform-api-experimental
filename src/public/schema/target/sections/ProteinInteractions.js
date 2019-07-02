import { gql } from 'apollo-server-express';

export const id = 'proteinInteractions';

export const summaryTypeDefs = gql`
  type TargetSummaryProteinInteractions {
    ppi: Int!
    pathways: Int!
    enzymeSubstrate: Int!
    interactorsCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
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

export const sectionTypeDefs = gql`
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

export const sectionResolvers = {
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
