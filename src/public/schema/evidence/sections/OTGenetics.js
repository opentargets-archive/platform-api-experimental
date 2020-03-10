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
    rsId: String!
    # pval: Float!
    # oddsRatio: Float
    # confidenceInterval: String
    # vepConsequence: VEPConsequence
    source: Source!
  }
  type EvidenceDetailOtGenetics {
    rows: [EvidenceRowOtGenetics!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailOtGenetics: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceOTGenetics(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
