import { gql } from 'apollo-server-express';

import { evidencePathways } from '../../../apis/openTargets';

export const id = 'crispr';

export const summaryTypeDefs = gql`
  type EvidenceSummaryCrispr {
    hasCrispr: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryCrispr: {
    hasCrispr: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(({ hasCrispr }) => hasCrispr),
    sources: () => [
      {
        name: 'CRISPR',
        url:
          'https://docs.targetvalidation.org/data-sources/affected-pathways#crispr',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowCrispr {
    disease: Disease!
    score: Float!
    method: String!
    source: Source!
  }
  type EvidenceDetailCrispr {
    rows: [EvidenceRowCrispr!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailCrispr: {
    rows: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(({ rowsCrispr }) => rowsCrispr),
  },
};
