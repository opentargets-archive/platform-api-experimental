import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type TargetSummaryPathways {
    count: Int!
  }
`;

export const resolvers = {
  TargetSummaryPathways: {
    count: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ pathways }) => pathways.count),
  },
};
