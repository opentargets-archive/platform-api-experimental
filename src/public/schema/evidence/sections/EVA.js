import { gql } from 'apollo-server-express';

import { evidenceEVA } from '../../../apis/openTargets';

export const id = 'eva';

export const summaryTypeDefs = gql`
  type EvidenceSummaryEva {
    variantCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryEva: {
    variantCount: ({ _ensgId, _efoId }) =>
      evidenceEVA(_ensgId, _efoId).then(({ variantCount }) => variantCount),
    sources: () => [
      {
        name: 'EVA',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#european-variation-archive-eva',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowEva {
    disease: Disease!
    rsId: String!
    clinVarId: String!
    vepConsequence: String!
    clinicalSignificance: String!
    pmId: String
  }
  type EvidenceDetailEva {
    rows: [EvidenceRowEva!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailEva: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceEVA(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
