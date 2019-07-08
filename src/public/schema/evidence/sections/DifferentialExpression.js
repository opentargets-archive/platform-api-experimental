import { gql } from 'apollo-server-express';

import { evidenceDifferentialExpression } from '../../../apis/openTargets';

export const id = 'differentialExpression';

export const summaryTypeDefs = gql`
  type EvidenceSummaryDifferentialExpression {
    experimentCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryDifferentialExpression: {
    experimentCount: ({ _ensgId, _efoId }) =>
      evidenceDifferentialExpression(_ensgId, _efoId).then(
        ({ experimentCount }) => experimentCount
      ),
    sources: () => [
      {
        name: 'Expression Atlas',
        url:
          'https://docs.targetvalidation.org/data-sources/rna-expression#expression-atlas',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type Tissue {
    id: String!
    name: String!
  }
  type DifferentialExpressionActivity {
    url: String!
    name: String!
  }
  type DifferentialExpressionExperiment {
    url: String!
    name: String!
  }
  type EvidenceRowDifferentialExpression {
    disease: Disease!
    tissue: Tissue!
    activity: DifferentialExpressionActivity!
    comparison: String!
    evidenceSource: String!
    log2FoldChange: Float!
    percentileRank: Int!
    pval: Float!
    experiment: DifferentialExpressionExperiment!
  }
  type EvidenceDetailDifferentialExpression {
    rows: [EvidenceRowDifferentialExpression!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailDifferentialExpression: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceDifferentialExpression(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
