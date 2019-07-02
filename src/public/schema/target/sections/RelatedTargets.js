import { gql } from 'apollo-server-express';

import { targetSimilar } from '../../../apis/openTargets';

export const id = 'relatedTargets';

export const summaryTypeDefs = gql`
  type TargetSummaryRelatedTargets {
    relatedTargetsCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryRelatedTargets: {
    relatedTargetsCount: ({ _ensgId }) =>
      targetSimilar(_ensgId).then(response => response.data.data.length),
    sources: () => [
      {
        name: 'Open Targets',
        url: 'https://docs.targetvalidation.org/getting-started/scoring',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type RowRelatedTarget {
    A: Target!
    B: Target!
    diseaseCountA: Int!
    diseaseCountB: Int!
    diseaseCountAAndB: Int!
    diseaseCountAOrB: Int!
  }
  type TargetDetailRelatedTargets {
    rows: [RowRelatedTarget!]!
  }
`;

export const sectionResolvers = {
  TargetDetailRelatedTargets: {
    rows: ({ _ensgId }) =>
      targetSimilar(_ensgId).then(response =>
        response.data.data.map(d => ({
          A: { id: d.subject.id, symbol: d.subject.label },
          B: { id: d.object.id, symbol: d.object.label },
          diseaseCountA: d.subject.links.diseases_count,
          diseaseCountB: d.object.links.diseases_count,
          diseaseCountAAndB: d.counts.shared_count,
          diseaseCountAOrB: d.counts.union_count,
        }))
      ),
  },
};
