import { gql } from "apollo-server-express";
import _ from "lodash";

// import {
//   typeDefs as TargetSummaryPathways,
//   resolvers as resolversTargetSummary,
// } from "./summaries/Pathways";

// import {
//   typeDefs as TargetSummaryProtein,
//   resolvers as resolversTargetProtein,
// } from "./summaries/Protein";

// import {
//   typeDefs as TargetSummaryChemicalProbes,
//   resolvers as resolversTargetChemicalProbes,
// } from "./summaries/ChemicalProbes";

import {
  typeDefs as TargetDetailCancerBiomarkers,
  resolvers as resolversTargetCancerBiomarkers,
} from "./details/CancerBiomarkers";

import {
  typeDefs as TargetDetailDrugs,
  resolvers as resolversTargetDrugs,
} from "./details/Drugs";

// import {
//   typeDefs as TargetSummaryRelatedTargets,
//   resolvers as resolversTargetRelatedTargets,
// } from "./summaries/RelatedTargets";

export const typeDefs = [
  // TargetSummaryPathways,
  // TargetSummaryProtein,
  // TargetSummaryChemicalProbes,
  TargetDetailCancerBiomarkers,
  TargetDetailDrugs,
  // TargetSummaryRelatedTargets,
  gql`
    type TargetDetails {
      # pathways: TargetSummaryPathways
      # protein: TargetSummaryProtein
      # chemicalProbes: TargetSummaryChemicalProbes
      cancerBiomarkers: TargetDetailCancerBiomarkers
      drugs: TargetDetailDrugs
      # relatedTargets: TargetSummaryRelatedTargets
    }
  `,
];

export const resolvers = _.merge(
  // resolversTargetSummary,
  // resolversTargetProtein,
  // resolversTargetChemicalProbes,
  resolversTargetCancerBiomarkers,
  resolversTargetDrugs,
  // resolversTargetRelatedTargets,
  {
    TargetDetails: {
      // pathways: () => ({}),
      // protein: () => ({}),
      // chemicalProbes: () => ({}),
      cancerBiomarkers: ({ _ensgId }) => ({ _ensgId }),
      // drugs: () => ({}),
      drugs: ({ _ensgId }) => ({ _ensgId }),
      // relatedTargets: () => ({}),
    },
  }
);
