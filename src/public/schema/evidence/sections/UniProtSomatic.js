import { gql } from 'apollo-server-express';

import { evidenceUniProtSomatic } from '../../../apis/openTargets';

export const id = 'uniProtSomatic';

export const summaryTypeDefs = gql`
  type EvidenceSummaryUniProtSomatic {
    hasVariants: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryUniProtSomatic: {
    hasVariants: ({ _ensgId, _efoId }) =>
      evidenceUniProtSomatic(_ensgId, _efoId).then(
        ({ hasVariants }) => hasVariants
      ),
    sources: () => [
      {
        name: 'UniProt Somatic',
        url:
          'https://docs.targetvalidation.org/data-sources/somatic-mutations#uniprot-somatic',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowUniProtSomatic {
    disease: Disease!
    vepConsequence: VEPConsequence!
    source: Source!
    pmIds: [String!]!
  }
  type EvidenceDetailUniProtSomatic {
    rows: [EvidenceRowUniProtSomatic!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailUniProtSomatic: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceUniProtSomatic(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
