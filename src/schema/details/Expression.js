import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Rna {
    zscore: Int!
    unit: String!
    value: Float!
    level: Int!
  }
  type Protein {
    cellType: [CellType!]!
    reliability: Boolean!
    level: Int!
  }
  type CellType {
    reliability: Boolean!
    name: String!
    level: Int!
  }
  type RowExpression {
    uberonId: String!
    rna: Rna!
    label: String!
    anatomicalSystems: [String!]!
    protein: Protein!
    organs: [String!]!
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
