import { gql } from 'apollo-server-express';

import { evidenceGene2Phenotype } from '../../../apis/openTargets';

export const id = 'gene2Phenotype';

export const summaryTypeDefs = gql`
  type EvidenceSummaryGene2Phenotype {
    hasPanel: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryGene2Phenotype: {
    hasPanel: ({ _ensgId, _efoId }) =>
      evidenceGene2Phenotype(_ensgId, _efoId).then(
        ({ hasGene2Phenotype }) => hasGene2Phenotype
      ),
    sources: () => [
      {
        name: 'Gene2Phenotype',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#gene-2-phenotype',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowGene2Phenotype {
    disease: Disease!
    panelsUrl: String!
    pmId: String!
  }
  type EvidenceDetailGene2Phenotype {
    rows: [EvidenceRowGene2Phenotype!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailGene2Phenotype: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceGene2Phenotype(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
