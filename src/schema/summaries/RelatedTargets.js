import { gql } from "apollo-server-express";

import { targetSimilar } from "../../apis/openTargets";

export const typeDefs = gql`
  type TargetSummaryRelatedTargets {
    relatedTargetsCount: Int!
  }
`;

export const resolvers = {
  TargetSummaryRelatedTargets: {
    relatedTargetsCount: (obj, args, { ensgId }) =>
      targetSimilar(ensgId).then(response => response.data.data.length),
  },
};
