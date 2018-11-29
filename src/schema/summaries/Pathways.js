import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type TargetSummaryPathways2 {
    count: Int!
  }
`;

export const resolvers = {
  TargetSummaryPathways2: {
    count: (obj, args, { ensgId, targetLoader }) =>
      targetLoader.load(ensgId).then(({ pathways }) => pathways.count),
  },
};
