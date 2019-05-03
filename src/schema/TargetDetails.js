import { gql } from 'apollo-server-express';
import _ from 'lodash';

import {
  typeDefs as TargetDetailHomology,
  resolvers as resolversTargetHomology,
} from "./details/Homology";

import {
  typeDefs as TargetDetailMousePhenotypes,
  resolvers as resolversTargetMousePhenotypes,
} from './details/MousePhenotypes';

import {
  typeDefs as TargetDetailGeneOntology,
  resolvers as resolversTargetGeneOntology,
} from './details/GeneOntology';

import {
  typeDefs as TargetDetailPathways,
  resolvers as resolversTargetPathways,
} from './details/Pathways';

import {
  typeDefs as TargetDetailProtein,
  resolvers as resolversTargetProtein,
} from './details/Protein';

import {
  typeDefs as TargetDetailChemicalProbes,
  resolvers as resolversTargetChemicalProbes,
} from './details/ChemicalProbes';

import {
  typeDefs as TargetDetailCancerBiomarkers,
  resolvers as resolversTargetCancerBiomarkers,
} from './details/CancerBiomarkers';

import {
  typeDefs as TargetDetailDrugs,
  resolvers as resolversTargetDrugs,
} from './details/Drugs';

import {
  typeDefs as TargetDetailRelatedTargets,
  resolvers as resolversTargetRelatedTargets,
} from './details/RelatedTargets';

import {
  typeDefs as TargetDetailTractability,
  resolvers as resolversTargetTractability,
} from './details/Tractability';

import {
  typeDefs as TargetDetailCancerHallmarks,
  resolvers as resolversTargetCancerHallmarks,
} from './details/CancerHallmarks';

export const typeDefs = [
  TargetDetailHomology,
  TargetDetailMousePhenotypes,
  TargetDetailGeneOntology,
  TargetDetailPathways,
  TargetDetailProtein,
  TargetDetailChemicalProbes,
  TargetDetailCancerBiomarkers,
  TargetDetailDrugs,
  TargetDetailRelatedTargets,
  TargetDetailTractability,
  TargetDetailCancerHallmarks,
  gql`
    type TargetDetails {
      homology: TargetDetailHomology
      mousePhenotypes: TargetDetailMousePhenotypes
      geneOntology: TargetDetailGeneOntology
      pathways: TargetDetailPathways
      protein: TargetDetailProtein
      chemicalProbes: TargetDetailChemicalProbes
      cancerBiomarkers: TargetDetailCancerBiomarkers
      drugs: TargetDetailDrugs
      relatedTargets: TargetDetailRelatedTargets
      tractability: TargetDetailTractability
      cancerHallmarks: TargetDetailCancerHallmarks
    }
  `,
];

export const resolvers = _.merge(
  resolversTargetHomology,
  resolversTargetMousePhenotypes,
  resolversTargetGeneOntology,
  resolversTargetPathways,
  resolversTargetProtein,
  resolversTargetChemicalProbes,
  resolversTargetCancerBiomarkers,
  resolversTargetDrugs,
  resolversTargetRelatedTargets,
  resolversTargetTractability,
  resolversTargetCancerHallmarks,
  {
    TargetDetails: {
      homology: _.identity,
      mousePhenotypes: _.identity,
      geneOntology: _.identity,
      pathways: _.identity,
      protein: _.identity,
      chemicalProbes: _.identity,
      cancerBiomarkers: _.identity,
      drugs: _.identity,
      relatedTargets: _.identity,
      tractability: _.identity,
      cancerHallmarks: _.identity,
    },
  }
);
