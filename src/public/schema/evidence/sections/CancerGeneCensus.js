import { gql } from 'apollo-server-express';

import { evidenceCancerGeneCensus } from '../../../apis/openTargets';

export const id = 'cancerGeneCensus';

export const summaryTypeDefs = gql`
  type EvidenceSummaryCancerGeneCensus {
    hasMutations: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryCancerGeneCensus: {
    hasMutations: ({ _ensgId, _efoId }) =>
      evidenceCancerGeneCensus(_ensgId, _efoId).then(
        ({ hasMutations }) => hasMutations
      ),
    sources: () => [
      {
        name: 'Cancer Gene Census',
        url:
          'https://docs.targetvalidation.org/data-sources/somatic-mutations#cancer-gene-census',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowCancerGeneCensus {
    disease: Disease!
    mutationType: String!
    inheritancePattern: InheritancePattern!
    samplesWithMutationTypeCount: Int!
    mutatedSamplesCount: Int!
    source: Source!
    pmIds: [String!]!
  }
  type EvidenceDetailCancerGeneCensus {
    rows: [EvidenceRowCancerGeneCensus!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailCancerGeneCensus: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceCancerGeneCensus(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
