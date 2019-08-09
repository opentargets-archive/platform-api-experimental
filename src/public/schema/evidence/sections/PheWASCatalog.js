import { gql } from 'apollo-server-express';

import { evidencePheWASCatalog } from '../../../apis/openTargets';

export const id = 'phewasCatalog';

export const summaryTypeDefs = gql`
  type EvidenceSummaryPhewasCatalog {
    variantCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryPhewasCatalog: {
    variantCount: ({ _ensgId, _efoId }) =>
      evidencePheWASCatalog(_ensgId, _efoId).then(
        ({ variantCount }) => variantCount
      ),
    sources: () => [
      {
        name: 'PheWAS Catalog',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#phewas-catalog',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowPhewasCatalog {
    disease: Disease!
    rsId: String!
    pval: Float!
    oddsRatio: Float
    confidenceInterval: String
    vepConsequence: VEPConsequence
    source: Source!
  }
  type EvidenceDetailPhewasCatalog {
    rows: [EvidenceRowPhewasCatalog!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailPhewasCatalog: {
    rows: ({ _ensgId, _efoId }) =>
      evidencePheWASCatalog(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
