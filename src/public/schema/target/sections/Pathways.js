import { gql } from 'apollo-server-express';

export const id = 'pathways';

export const summaryTypeDefs = gql`
  type TargetSummaryPathways {
    count: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryPathways: {
    count: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ pathways }) => pathways.count),
    sources: () => [{ name: 'Reactome', url: 'https://reactome.org/' }],
  },
};

export const sectionTypeDefs = gql`
  type ReactomePathway {
    id: String!
    name: String!
  }
  type TopLevelReactomePathway {
    id: String!
    name: String!
    isAssociated: Boolean!
  }
  type LowLevelReactomePathway {
    id: String!
    name: String!
    parents: [ReactomePathway!]!
  }
  type TargetDetailPathways {
    topLevelPathways: [TopLevelReactomePathway!]!
    lowLevelPathways: [LowLevelReactomePathway!]!
  }
`;

export const sectionResolvers = {
  TargetDetailPathways: {
    topLevelPathways: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ pathways }) => pathways.topLevelPathways),
    lowLevelPathways: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ pathways }) => pathways.lowLevelPathways),
  },
};
