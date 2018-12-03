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

import {
  typeDefs as TargetSummaryCancerBiomarkers,
  resolvers as resolversTargetCancerBiomarkers,
} from "./summaries/CancerBiomarkers";

import {
  typeDefs as TargetSummaryDrugs,
  resolvers as resolversTargetDrugs,
} from "./summaries/Drugs";

import {
  typeDefs as TargetSummaryRelatedTargets,
  resolvers as resolversTargetRelatedTargets,
} from "./summaries/RelatedTargets";

export const typeDefs = [
  TargetSummaryPathways,
  TargetSummaryProtein,
  TargetSummaryChemicalProbes,
  TargetSummaryCancerBiomarkers,
  TargetSummaryDrugs,
  TargetSummaryRelatedTargets,
  gql`
    type TargetSummaries {
      pathways: TargetSummaryPathways
      protein: TargetSummaryProtein
      chemicalProbes: TargetSummaryChemicalProbes
      cancerBiomarkers: TargetSummaryCancerBiomarkers
      drugs: TargetSummaryDrugs
      relatedTargets: TargetSummaryRelatedTargets
    }
  `,
];

export const resolvers = _.merge(
  resolversTargetSummary,
  resolversTargetProtein,
  resolversTargetChemicalProbes,
  resolversTargetCancerBiomarkers,
  resolversTargetDrugs,
  resolversTargetRelatedTargets,
  {
    TargetSummaries: {
      pathways: () => ({}),
      protein: () => ({}),
      chemicalProbes: () => ({}),
      cancerBiomarkers: () => ({}),
      drugs: () => ({}),
      relatedTargets: () => ({}),
    },
  }
);
