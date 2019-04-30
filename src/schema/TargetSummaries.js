import { gql } from "apollo-server-express";
import _ from "lodash";

import {
  typeDefs as TargetSummaryGeneOntology,
  resolvers as resolversTargetGeneOntology,
} from "./summaries/GeneOntology";

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

import {
  typeDefs as TargetSummaryTractability,
  resolvers as resolversTargetTractability,
} from "./summaries/Tractability";

import {
  typeDefs as TargetSummaryProteinInteractions,
  resolvers as resolversTargetProteinInteractions
} from "./summaries/ProteinInteractions";

import {
  typeDefs as TargetSummaryRNAAndProteinExpression,
  resolvers as resolversTargetRNAAndProteinExpression
} from "./summaries/RNAAndProteinExpression";

export const typeDefs = [
  TargetSummaryGeneOntology,
  TargetSummaryPathways,
  TargetSummaryProtein,
  TargetSummaryChemicalProbes,
  TargetSummaryCancerBiomarkers,
  TargetSummaryDrugs,
  TargetSummaryRelatedTargets,
  TargetSummaryTractability,
  TargetSummaryProteinInteractions,
  TargetSummaryRNAAndProteinExpression,
  gql`
    type TargetSummaries {
      geneOntology: TargetSummaryGeneOntology
      pathways: TargetSummaryPathways
      protein: TargetSummaryProtein
      chemicalProbes: TargetSummaryChemicalProbes
      cancerBiomarkers: TargetSummaryCancerBiomarkers
      drugs: TargetSummaryDrugs
      relatedTargets: TargetSummaryRelatedTargets
      tractability: TargetSummaryTractability
      proteinInteractions: TargetSummaryProteinInteractions
      rnaAndProteinExpression: TargetSummaryRNAAndProteinExpression
    }
  `,
];

export const resolvers = _.merge(
  resolversTargetGeneOntology,
  resolversTargetSummary,
  resolversTargetProtein,
  resolversTargetChemicalProbes,
  resolversTargetCancerBiomarkers,
  resolversTargetDrugs,
  resolversTargetRelatedTargets,
  resolversTargetTractability,
  resolversTargetProteinInteractions,
  resolversTargetRNAAndProteinExpression,
  {
    TargetSummaries: {
      geneOntology: _.identity,
      pathways: _.identity,
      protein: _.identity,
      chemicalProbes: _.identity,
      cancerBiomarkers: _.identity,
      drugs: _.identity,
      relatedTargets: _.identity,
      tractability: _.identity,
      proteinInteractions: _.identity,
      rnaAndProteinExpression: _.identity,
    },
  }
);
