import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TargetSummaryExpression {
    rnaBaselineExpression: Boolean!
    proteinBaselineExpression: Boolean!
    expressionAtlasExperiment: Boolean!
    gtexData: Boolean!
  }
`;

export const resolvers = {
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
