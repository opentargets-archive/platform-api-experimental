import { gql } from 'apollo-server-express';

export const id = 'expression';

export const summaryTypeDefs = gql`
  type TargetSummaryExpression {
    rnaBaselineExpression: Boolean!
    proteinBaselineExpression: Boolean!
    expressionAtlasExperiment: Boolean!
    gtexData: Boolean!
  }
`;

export const summaryResolvers = {
  TargetSummaryExpression: {
    rnaBaselineExpression: ({ _ensgId }, args, { expressionLoader }) =>
      expressionLoader
        .load(_ensgId)
        .then(({ rnaBaselineExpression }) => rnaBaselineExpression),
    proteinBaselineExpression: ({ _ensgId }, args, { expressionLoader }) =>
      expressionLoader
        .load(_ensgId)
        .then(({ proteinBaselineExpression }) => proteinBaselineExpression),
    expressionAtlasExperiment: ({ _ensgId }, args, { atlasLoader }) =>
      atlasLoader.load(_ensgId).then(({ atlasExperiment }) => atlasExperiment),
    gtexData: ({ _ensgId, symbol }, args, { gtexLoader, targetLoader }) => {
      if (symbol) {
        return gtexLoader.load(symbol).then(({ gtexData }) => gtexData);
      } else {
        return targetLoader.load(_ensgId).then(({ symbol }) => {
          return gtexLoader.load(symbol).then(({ gtexData }) => gtexData);
        });
      }
    },
  },
};

export const sectionTypeDefs = gql`
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

export const sectionResolvers = {
  TargetDetailExpression: {
    rows: ({ _ensgId }, args, { expressionLoader }) =>
      expressionLoader.load(_ensgId).then(({ rows }) => rows),
  },
};
