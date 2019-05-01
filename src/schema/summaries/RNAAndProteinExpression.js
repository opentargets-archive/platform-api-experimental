import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TargetSummaryRNAAndProteinExpression {
    rnaBaselineExpression: Boolean!
    proteinBaselineExpression: Boolean!
  }
`;

export const resolvers = {
  TargetSummaryRNAAndProteinExpression: {
    rnaBaselineExpression: ({ _ensgId }, args, { expressionLoader }) =>
      expressionLoader
        .load(_ensgId)
        .then(({ rnaBaselineExpression }) => rnaBaselineExpression),
    proteinBaselineExpression: ({ _ensgId }, args, { expressionLoader }) =>
      expressionLoader
        .load(_ensgId)
        .then(({ proteinBaselineExpression }) => proteinBaselineExpression),
  },
};
