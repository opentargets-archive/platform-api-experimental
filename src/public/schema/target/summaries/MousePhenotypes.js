import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TargetSummaryMousePhenotypes {
    phenotypeCount: Int!
    categoryCount: Int!
    sources: [Source!]!
  }
`;

export const resolvers = {
  TargetSummaryMousePhenotypes: {
    phenotypeCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ mousePhenotypes }) => mousePhenotypes.phenotypeCount),
    categoryCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ mousePhenotypes }) => mousePhenotypes.categoryCount),
    sources: () => [
      {
        name: 'MGI',
        url: 'http://www.informatics.jax.org/',
      },
    ],
  },
};
