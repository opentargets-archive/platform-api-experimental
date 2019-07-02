import { gql } from 'apollo-server-express';

export const id = 'mousePhenotypes';

export const summaryTypeDefs = gql`
  type TargetSummaryMousePhenotypes {
    phenotypeCount: Int!
    categoryCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
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

export const sectionTypeDefs = gql`
  type MousePhenotypeRow {
    mouseGeneId: String!
    mouseGeneSymbol: String!
    categoryId: String!
    categoryLabel: String!
    phenotypeId: String!
    phenotypeLabel: String!
    subjectAllelicComposition: String!
    subjectBackground: String!
    pmIds: [String!]!
  }
  type MousePhenotypeCategory {
    id: String!
    name: String!
    isAssociated: Boolean!
  }
  type TargetDetailMousePhenotypes {
    categories: [MousePhenotypeCategory!]!
    rows: [MousePhenotypeRow!]!
  }
`;

export const sectionResolvers = {
  TargetDetailMousePhenotypes: {
    categories: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ mousePhenotypes }) => mousePhenotypes.categories),
    rows: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ mousePhenotypes }) => mousePhenotypes.rows),
  },
};
