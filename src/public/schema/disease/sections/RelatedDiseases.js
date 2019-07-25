import { gql } from 'apollo-server-express';

import { diseaseSimilar, associations } from '../../../apis/openTargets';

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
  type ExpandedRowRelatedDisease {
    target: Target!
    associationScoreA: Float!
    associationScoreB: Float!
  }
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
    expanded(otherEfoId: String!): [ExpandedRowRelatedDisease!]!
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
    expanded: ({ _efoId }, { otherEfoId }) =>
      diseaseSimilar(_efoId)
        .then(response => {
          const entry = response.data.data.find(
            d => d.object.id === otherEfoId
          );
          const { shared_targets: ensgIds } = entry;
          const pageEfoIdQuery = { ensgIds, efoIds: [_efoId] };
          const otherEfoIdQuery = { ensgIds, efoIds: [otherEfoId] };
          return Promise.all([
            Promise.resolve(ensgIds),
            associations(pageEfoIdQuery),
            associations(otherEfoIdQuery),
          ]);
        })
        .then(([ensgIds, pageResponse, otherResponse]) =>
          ensgIds.map(ensgId => {
            const pageRow = pageResponse.data.data.find(
              d => d.target.id === ensgId
            );
            const otherRow = otherResponse.data.data.find(
              d => d.target.id === ensgId
            );
            return {
              target: {
                id: ensgId,
                symbol: pageRow.target.gene_info.symbol,
              },
              associationScoreA: pageRow.association_score.overall,
              associationScoreB: otherRow.association_score.overall,
            };
          })
        ),
  },
};
