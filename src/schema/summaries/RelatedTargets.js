import { gql } from "apollo-server-express";

import { targetSimilar } from "../../apis/openTargets";

export const typeDefs = gql`
  type TargetSummaryRelatedTargets {
    relatedTargetsCount: Int!
  }
`;

export const resolvers = {
  TargetSummaryRelatedTargets: {
    relatedTargetsCount: ({ _ensgId }) =>
      targetSimilar(_ensgId).then(response => response.data.data.length),
  },
};
