import { gql } from 'apollo-server-express';

import { diseaseSimilar } from '../../../apis/openTargets';

export const id = 'phenotypes';

export const summaryTypeDefs = gql`
  type DiseaseSummaryPhenotypes {
    phenotypesCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  DiseaseSummaryPhenotypes: {
    phenotypesCount: ({ _efoId }, args, { diseaseLoader }) =>
      diseaseLoader.load(_efoId).then(({ phenotypes }) => phenotypes.length),
    sources: () => [
      {
        name: 'EFO',
        url: 'https://www.ebi.ac.uk/efo/',
      },
      {
        name: 'Orphanet',
        url: 'https://www.orpha.net',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type DiseasePhenotype {
    id: String!
    name: String!
    url: String!
  }
  type DiseaseDetailPhenotypes {
    rows: [DiseasePhenotype!]!
  }
`;

export const sectionResolvers = {
  DiseaseDetailPhenotypes: {
    rows: ({ _efoId }, args, { diseaseLoader }) =>
      diseaseLoader.load(_efoId).then(({ phenotypes }) => phenotypes),
  },
};
