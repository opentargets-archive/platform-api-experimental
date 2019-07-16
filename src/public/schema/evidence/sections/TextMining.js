import { gql } from 'apollo-server-express';

import {
  evidenceTextMining,
  evidenceTextMiningSummary,
} from '../../../apis/openTargets';

export const id = 'textMining';

export const summaryTypeDefs = gql`
  type EvidenceSummaryTextMining {
    textMiningCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryTextMining: {
    textMiningCount: ({ _ensgId, _efoId }) =>
      evidenceTextMiningSummary(_ensgId, _efoId).then(
        ({ textMiningCount }) => textMiningCount
      ),
    sources: () => [
      {
        name: 'Europe PMC',
        url:
          'https://docs.targetvalidation.org/data-sources/text-mining#europe-pmc',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  # type Phenotype {
  #   id: String!
  #   name: String!
  #   url: String!
  # }
  type EvidenceRowTextMining {
    disease: Disease!
    # humanPhenotypes: [Phenotype!]!
    # modelPhenotypes: [Phenotype!]!
    # modelId: String!
    # allelicComposition: String!
    # geneticBackground: String!
    # source: Source!
  }
  type EvidenceDetailTextMining {
    rows: [EvidenceRowTextMining!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailTextMining: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceTextMining(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
