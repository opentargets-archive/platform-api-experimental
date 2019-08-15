import { gql } from 'apollo-server-express';

import { evidenceUniProtLiterature } from '../../../apis/openTargets';

export const id = 'uniProtLiterature';

export const summaryTypeDefs = gql`
  type EvidenceSummaryUniProtLiterature {
    hasVariants: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryUniProtLiterature: {
    hasVariants: ({ _ensgId, _efoId }) =>
      evidenceUniProtLiterature(_ensgId, _efoId).then(
        ({ hasVariants }) => hasVariants
      ),
    sources: () => [
      {
        name: 'UniProt Literature',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#uniprot-literature',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowUniProtLiterature {
    disease: Disease!
    source: Source!
    pmIds: [String!]!
  }
  type EvidenceDetailUniProtLiterature {
    rows: [EvidenceRowUniProtLiterature!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailUniProtLiterature: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceUniProtLiterature(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
