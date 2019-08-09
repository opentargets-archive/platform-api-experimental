import { gql } from 'apollo-server-express';

import { evidenceUniProt } from '../../../apis/openTargets';

export const id = 'uniProt';

export const summaryTypeDefs = gql`
  type EvidenceSummaryUniProt {
    variantCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryUniProt: {
    variantCount: ({ _ensgId, _efoId }) =>
      evidenceUniProt(_ensgId, _efoId).then(({ variantCount }) => variantCount),
    sources: () => [
      {
        name: 'UniProt',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#uniprot',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowUniProt {
    disease: Disease!
    rsId: String!
    vepConsequence: VEPConsequence!
    source: Source!
    pmIds: [String!]!
  }
  type EvidenceDetailUniProt {
    rows: [EvidenceRowUniProt!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailUniProt: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceUniProt(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
