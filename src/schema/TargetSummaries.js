import { gql } from "apollo-server-express";
import _ from "lodash";

import {
  typeDefs as TargetSummaryPathway2,
  resolvers as resolversTargetSummary2,
} from "./summaries/Pathways";

export const typeDefs = [
  TargetSummaryPathway2,
  gql`
    type TargetSummaries {
      pathways: TargetSummaryPathways2
    }
  `,
];

export const resolvers = _.merge(resolversTargetSummary2, {
  TargetSummaries: {
    pathways: () => ({}),
  },
});
