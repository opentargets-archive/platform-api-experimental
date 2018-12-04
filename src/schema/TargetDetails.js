import { gql } from "apollo-server-express";
import _ from "lodash";

import {
  typeDefs as TargetDetailPathways,
  resolvers as resolversTargetPathways,
} from "./details/Pathways";

// import {
//   typeDefs as TargetSummaryProtein,
//   resolvers as resolversTargetProtein,
// } from "./summaries/Protein";

import {
  typeDefs as TargetDetailChemicalProbes,
  resolvers as resolversTargetChemicalProbes,
} from "./details/ChemicalProbes";

import {
  typeDefs as TargetDetailCancerBiomarkers,
  resolvers as resolversTargetCancerBiomarkers,
} from "./details/CancerBiomarkers";

import {
  typeDefs as TargetDetailDrugs,
  resolvers as resolversTargetDrugs,
} from "./details/Drugs";

import {
  typeDefs as TargetDetailRelatedTargets,
  resolvers as resolversTargetRelatedTargets,
} from "./details/RelatedTargets";

export const typeDefs = [
  TargetDetailPathways,
  // TargetSummaryProtein,
  TargetDetailChemicalProbes,
  TargetDetailCancerBiomarkers,
  TargetDetailDrugs,
  TargetDetailRelatedTargets,
  gql`
    type TargetDetails {
      pathways: TargetDetailPathways
      # protein: TargetSummaryProtein
      chemicalProbes: TargetDetailChemicalProbes
      cancerBiomarkers: TargetDetailCancerBiomarkers
      drugs: TargetDetailDrugs
      relatedTargets: TargetDetailRelatedTargets
    }
  `,
];

export const resolvers = _.merge(
  resolversTargetPathways,
  // resolversTargetProtein,
  resolversTargetChemicalProbes,
  resolversTargetCancerBiomarkers,
  resolversTargetDrugs,
  resolversTargetRelatedTargets,
  {
    TargetDetails: {
      pathways: ({ _ensgId }) => ({ _ensgId }),
      // protein: () => ({}),
      chemicalProbes: ({ _ensgId }) => ({ _ensgId }),
      cancerBiomarkers: ({ _ensgId }) => ({ _ensgId }),
      drugs: ({ _ensgId }) => ({ _ensgId }),
      relatedTargets: ({ _ensgId }) => ({ _ensgId }),
    },
  }
);
