import { gql } from 'apollo-server-express';

import { diseaseSimilar } from '../../../apis/openTargets';

export const id = 'relatedDiseases';

export const summaryTypeDefs = gql`
  type DiseaseSummaryRelatedDiseases {
    relatedDiseasesCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  DiseaseSummaryRelatedDiseases: {
    relatedDiseasesCount: ({ _efoId }) =>
      diseaseSimilar(_efoId).then(response => response.data.data.length),
    sources: () => [
      {
        name: 'Open Targets',
        url: 'https://docs.targetvalidation.org/getting-started/scoring',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type RowRelatedDisease {
    A: Disease!
    B: Disease!
    targetCountA: Int!
    targetCountB: Int!
    targetCountAAndB: Int!
    targetCountAOrB: Int!
    score: Float!
  }
  type DiseaseDetailRelatedDiseases {
    rows: [RowRelatedDisease!]!
  }
`;

export const sectionResolvers = {
  DiseaseDetailRelatedDiseases: {
    rows: ({ _efoId }) =>
      diseaseSimilar(_efoId).then(response =>
        response.data.data.map(d => ({
          A: { id: d.subject.id, name: d.subject.label },
          B: { id: d.object.id, name: d.object.label },
          targetCountA: d.subject.links.targets_count,
          targetCountB: d.object.links.targets_count,
          targetCountAAndB: d.counts.shared_count,
          targetCountAOrB: d.counts.union_count,
          score: d.value,
        }))
      ),
  },
};
