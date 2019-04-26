import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type TargetSummaryRNAAndProteinExpression {
    rnaBaselineExpression: Boolean!
    proteinBaselineExpression: Boolean!
    genotypeTissueExpression: Boolean!
  }
`;

export const resolvers = {
  TargetSummaryRNAAndProteinExpression: {
    rnaBaselineExpression: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ rnaAndProteinExpression }) => rnaAndProteinExpression.rnaBaselineExpression),
    proteinBaselineExpression: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ rnaAndProteinExpression }) => rnaAndProteinExpression.proteinBaselineExpression),
    genotypeTissueExpression: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ rnaAndProteinExpression }) => rnaAndProteinExpression.genotypeTissueExpression),
  },
};
