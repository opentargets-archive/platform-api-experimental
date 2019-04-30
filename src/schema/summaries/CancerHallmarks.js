import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type CancerHallmarkPromotionAndSuppression {
    name: String!
    promotes: Boolean!
    suppresses: Boolean!
  }
  type CancerHallmarkRoleInCancer {
    name: String!
    pmId: String!
  }
  type TargetSummaryCancerHallmarks {
    promotionAndSuppressionByHallmark: [CancerHallmarkPromotionAndSuppression!]!
    roleInCancer: [CancerHallmarkRoleInCancer!]!
    sources: [Source!]!
  }
`;

export const resolvers = {
  TargetSummaryCancerHallmarks: {
    promotionAndSuppressionByHallmark: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(
          ({ cancerHallmarks }) =>
            cancerHallmarks.promotionAndSuppressionByHallmark
        ),
    roleInCancer: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerHallmarks }) => cancerHallmarks.roleInCancer),
    sources: () => [
      {
        name: "Cancer Gene Census",
        url: "https://cancer.sanger.ac.uk/census#cl_search",
      },
    ],
  },
};
