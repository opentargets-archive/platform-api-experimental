import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Rna {
    value: Float!
    level: Int!
  }
  type Protein {
    level: Int!
  }
  type RowExpression {
    label: String!
    organs: [String!]!
    anatomicalSystems: [String!]!
    rna: Rna!
    protein: Protein!
  }
  type TargetDetailExpression {
    rows: [RowExpression!]!
  }
`;

export const resolvers = {
  TargetDetailExpression: {
    rows: ({ _ensgId }, args, { expressionLoader }) =>
      expressionLoader.load(_ensgId).then(({ rows }) => rows),
  },
};
