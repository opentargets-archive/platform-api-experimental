import { gql } from 'apollo-server-express';

import { evidenceEVASomatic } from '../../../apis/openTargets';

export const id = 'evaSomatic';

export const summaryTypeDefs = gql`
  type EvidenceSummaryEvaSomatic {
    variantCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryEvaSomatic: {
    variantCount: ({ _ensgId, _efoId }) =>
      evidenceEVASomatic(_ensgId, _efoId).then(
        ({ variantCount }) => variantCount
      ),
    sources: () => [
      {
        name: 'EVA',
        url:
          'https://docs.targetvalidation.org/data-sources/somatic-mutations#european-variation-archive-eva',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowEvaSomatic {
    disease: Disease!
    rsId: String!
    clinVarId: String!
    vepConsequence: VEPConsequence!
    clinicalSignificance: String!
    pmId: String
  }
  type EvidenceDetailEvaSomatic {
    rows: [EvidenceRowEvaSomatic!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailEvaSomatic: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceEVASomatic(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
