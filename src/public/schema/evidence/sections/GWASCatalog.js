import { gql } from 'apollo-server-express';

import { evidenceGWASCatalog } from '../../../apis/openTargets';

export const id = 'gwasCatalog';

export const summaryTypeDefs = gql`
  type EvidenceSummaryGwasCatalog {
    variantCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryGwasCatalog: {
    variantCount: ({ _ensgId, _efoId }) =>
      evidenceGWASCatalog(_ensgId, _efoId).then(
        ({ variantCount }) => variantCount
      ),
    sources: () => [
      {
        name: 'GWAS Catalog',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#gwas-catalog',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowGwasCatalog {
    disease: Disease!
    rsId: String!
    pval: Float!
    oddsRatio: Float
    confidenceInterval: String
    vepConsequence: String
    source: Source!
  }
  type EvidenceDetailGwasCatalog {
    rows: [EvidenceRowGwasCatalog!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailGwasCatalog: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceGWASCatalog(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
