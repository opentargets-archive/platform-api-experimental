import { gql } from "apollo-server-express";

export const typeDefs = gql`
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

export const resolvers = {
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
