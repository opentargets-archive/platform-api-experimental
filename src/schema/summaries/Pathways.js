import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type TargetSummaryPathways {
    count: Int!
    sources: [Source!]!
  }
`;

export const resolvers = {
  TargetSummaryPathways: {
    count: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ pathways }) => pathways.count),
    sources: () => [{ name: "Reactome", url: "https://reactome.org/" }],
  },
};
