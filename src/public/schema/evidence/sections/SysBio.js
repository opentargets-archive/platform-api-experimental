import { gql } from 'apollo-server-express';

import { evidencePathways } from '../../../apis/openTargets';

export const id = 'sysBio';

export const summaryTypeDefs = gql`
  type EvidenceSummarySysBio {
    hasSysBio: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummarySysBio: {
    hasSysBio: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(({ hasSysBio }) => hasSysBio),
    sources: () => [
      {
        name: 'CRISPR',
        url:
          'https://docs.targetvalidation.org/data-sources/affected-pathways#sysbio',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowSysBio {
    disease: Disease!
    geneSet: String!
    method: String!
    pmId: String!
  }
  type EvidenceDetailSysBio {
    rows: [EvidenceRowSysBio!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailSysBio: {
    rows: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(({ rowsSysBio }) => rowsSysBio),
  },
};
