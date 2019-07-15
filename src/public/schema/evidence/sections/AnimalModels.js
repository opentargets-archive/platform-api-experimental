import { gql } from 'apollo-server-express';

import { evidenceAnimalModels } from '../../../apis/openTargets';

export const id = 'animalModels';

export const summaryTypeDefs = gql`
  type EvidenceSummaryAnimalModels {
    mouseModelCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryAnimalModels: {
    mouseModelCount: ({ _ensgId, _efoId }) =>
      evidenceAnimalModels(_ensgId, _efoId).then(
        ({ mouseModelCount }) => mouseModelCount
      ),
    sources: () => [
      {
        name: 'PhenoDigm',
        url:
          'https://docs.targetvalidation.org/data-sources/animal-models#phenodigm',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type Phenotype {
    id: String!
    name: String!
    url: String!
  }
  type EvidenceRowAnimalModels {
    disease: Disease!
    humanPhenotypes: [Phenotype!]!
    modelPhenotypes: [Phenotype!]!
    modelId: String!
    allelicComposition: String!
    geneticBackground: String!
    source: Source!
  }
  type EvidenceDetailAnimalModels {
    rows: [EvidenceRowAnimalModels!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailAnimalModels: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceAnimalModels(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
