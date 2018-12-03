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

import {
  typeDefs as TargetSummaryChemicalProbes,
  resolvers as resolversTargetChemicalProbes,
} from "./summaries/ChemicalProbes";

export const typeDefs = [
  TargetSummaryPathways,
  TargetSummaryProtein,
  TargetSummaryChemicalProbes,
  gql`
    type TargetSummaries {
      pathways: TargetSummaryPathways
      protein: TargetSummaryProtein
      chemicalProbes: TargetSummaryChemicalProbes
    }
  `,
];

export const resolvers = _.merge(
  resolversTargetSummary,
  resolversTargetProtein,
  resolversTargetChemicalProbes,
  {
    TargetSummaries: {
      pathways: () => ({}),
      protein: () => ({}),
      chemicalProbes: () => ({}),
    },
  }
);
