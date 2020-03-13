import { gql } from 'apollo-server-express';

import { evidenceOTGenetics } from '../../../apis/openTargets';

export const id = 'otGenetics';

export const summaryTypeDefs = gql`
  type EvidenceSummaryOtGenetics {
    variantCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryOtGenetics: {
    variantCount: ({ _ensgId, _efoId }) =>
      evidenceOTGenetics(_ensgId, _efoId).then(
        ({ variantCount }) => variantCount
      ),
    sources: () => [
      {
        name: 'Open Target Genetics Portal',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#open-targets-genetics-portal',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowOtGenetics {
    disease: Disease!
    reportedTrait: Trait
    publications: [SimpleOtGeneticsPublication]
    variant: Variant!
    pval: Float!
    genePrioritisationScore: Float!
    source: Source!
  }
  type Variant {
    id: String!
    url: String!
  }
  type Trait {
    name: String!
    url: String!
  }
  type EvidenceDetailOtGenetics {
    rows: [EvidenceRowOtGenetics!]!
  }
  type SimpleOtGeneticsPublication {
    authors: [String]
    url: String
    year: String
    pmId: String!
  }
`;

export const sectionResolvers = {
  EvidenceDetailOtGenetics: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceOTGenetics(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
