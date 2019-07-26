import { gql } from 'apollo-server-express';

import { targetSimilar, associations } from '../../../apis/openTargets';

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
  type ExpandedRowRelatedTarget {
    disease: Disease!
    associationScoreA: Float!
    associationScoreB: Float!
  }
  type RowRelatedTarget {
    A: Target!
    B: Target!
    diseaseCountA: Int!
    diseaseCountB: Int!
    diseaseCountAAndB: Int!
    diseaseCountAOrB: Int!
    score: Float!
  }
  type TargetDetailRelatedTargets {
    rows: [RowRelatedTarget!]!
    expanded(otherEnsgId: String!): [ExpandedRowRelatedTarget!]!
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
          score: d.value,
        }))
      ),
    expanded: ({ _ensgId }, { otherEnsgId }) =>
      targetSimilar(_ensgId)
        .then(response => {
          const entry = response.data.data.find(
            d => d.object.id === otherEnsgId
          );
          const { shared_diseases: efoIds } = entry;
          const pageEnsgIdQuery = { ensgIds: [_ensgId], efoIds };
          const otherEnsgIdQuery = { ensgIds: [otherEnsgId], efoIds };
          return Promise.all([
            Promise.resolve(efoIds),
            associations(pageEnsgIdQuery),
            associations(otherEnsgIdQuery),
          ]);
        })
        .then(([efoIds, pageResponse, otherResponse]) =>
          efoIds.map(efoId => {
            const pageRow = pageResponse.data.data.find(
              d => d.disease.id === efoId
            );
            const otherRow = otherResponse.data.data.find(
              d => d.disease.id === efoId
            );
            return {
              disease: {
                id: efoId,
                name: pageRow.disease.efo_info.label,
              },
              associationScoreA: pageRow.association_score.overall,
              associationScoreB: otherRow.association_score.overall,
            };
          })
        ),
  },
};
