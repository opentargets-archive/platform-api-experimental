import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type MousePhenotypeRow {
    mouseGeneId: String!
    mouseGeneSymbol: String!
    categoryId: String!
    categoryLabel: String!
    phenotypeId: String!
    phenotypeLabel: String!
    subjectAllelicComposition: String!
    subjectBackground: String!
    pmId: String!
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

export const resolvers = {
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
