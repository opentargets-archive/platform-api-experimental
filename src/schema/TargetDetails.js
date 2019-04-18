import { gql } from "apollo-server-express";
import _ from "lodash";

import {
  typeDefs as TargetDetailGeneOntology,
  resolvers as resolversTargetGeneOntology,
} from "./details/GeneOntology";

import {
  typeDefs as TargetDetailPathways,
  resolvers as resolversTargetPathways,
} from "./details/Pathways";

import {
  typeDefs as TargetDetailProtein,
  resolvers as resolversTargetProtein,
} from "./details/Protein";

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

import {
  typeDefs as TargetDetailTractability,
  resolvers as resolversTargetTractability,
} from "./details/Tractability";

export const typeDefs = [
  TargetDetailGeneOntology,
  TargetDetailPathways,
  TargetDetailProtein,
  TargetDetailChemicalProbes,
  TargetDetailCancerBiomarkers,
  TargetDetailDrugs,
  TargetDetailRelatedTargets,
  TargetDetailTractability,
  gql`
    type TargetDetails {
      geneOntology: TargetDetailGeneOntology
      pathways: TargetDetailPathways
      protein: TargetDetailProtein
      chemicalProbes: TargetDetailChemicalProbes
      cancerBiomarkers: TargetDetailCancerBiomarkers
      drugs: TargetDetailDrugs
      relatedTargets: TargetDetailRelatedTargets
      tractability: TargetDetailTractability
    }
  `,
];

export const resolvers = _.merge(
  resolversTargetGeneOntology,
  resolversTargetPathways,
  resolversTargetProtein,
  resolversTargetChemicalProbes,
  resolversTargetCancerBiomarkers,
  resolversTargetDrugs,
  resolversTargetRelatedTargets,
  resolversTargetTractability,
  {
    TargetDetails: {
      geneOntology: _.identity,
      pathways: _.identity,
      protein: _.identity,
      chemicalProbes: _.identity,
      cancerBiomarkers: _.identity,
      drugs: _.identity,
      relatedTargets: _.identity,
      tractability: _.identity,
    },
  }
);
