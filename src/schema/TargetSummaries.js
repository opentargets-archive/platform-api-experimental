import { gql } from "apollo-server-express";
import _ from "lodash";

import {
  typeDefs as TargetSummaryPathways,
  resolvers as resolversTargetSummary,
} from "./summaries/Pathways";

import {
  typeDefs as TargetSummaryProtein,
  resolvers as resolversTargetProtein,
} from "./summaries/Protein";

export const typeDefs = [
  TargetSummaryPathways,
  TargetSummaryProtein,
  gql`
    type TargetSummaries {
      pathways: TargetSummaryPathways
      protein: TargetSummaryProtein
    }
  `,
];

export const resolvers = _.merge(
  resolversTargetSummary,
  resolversTargetProtein,
  {
    TargetSummaries: {
      pathways: () => ({}),
      protein: () => ({}),
    },
  }
);
