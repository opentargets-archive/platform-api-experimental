import { gql } from 'apollo-server-express';

import { targetSimilar } from '../../apis/openTargets';

export const typeDefs = gql`
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

export const resolvers = {
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
