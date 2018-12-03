import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type TargetSummaryPathways {
    count: Int!
  }
`;

export const resolvers = {
  TargetSummaryPathways: {
    count: (obj, args, { ensgId, targetLoader }) =>
      targetLoader.load(ensgId).then(({ pathways }) => pathways.count),
  },
};
