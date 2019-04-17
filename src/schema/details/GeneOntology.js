import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum GeneOntologyCategory {
    CELLULAR_COMPONENT
    BIOLOGICAL_PROCESS
    MOLECULAR_FUNCTION
  }
  type RowGeneOntology {
    id: String!
    term: String!
    category: GeneOntologyCategory!
  }
  type TargetDetailGeneOntology {
    rows: [RowGeneOntology!]!
  }
`;

export const resolvers = {
  TargetDetailGeneOntology: {
    rows: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ geneOntology }) => geneOntology.rows),
  },
};
