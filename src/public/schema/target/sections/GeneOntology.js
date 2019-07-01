import { gql } from 'apollo-server-express';

export const id = 'geneOntology';

export const summaryTypeDefs = gql`
  type TargetSummaryGeneOntology {
    molecularFunctionTermsCount: Int!
    biologicalProcessTermsCount: Int!
    cellularComponentTermsCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryGeneOntology: {
    molecularFunctionTermsCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ geneOntology }) => geneOntology.molecularFunctionTermsCount),
    biologicalProcessTermsCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ geneOntology }) => geneOntology.biologicalProcessTermsCount),
    cellularComponentTermsCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ geneOntology }) => geneOntology.cellularComponentTermsCount),
    sources: () => [{ name: 'GO', url: 'http://geneontology.org/' }],
  },
};

export const sectionTypeDefs = gql`
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

export const sectionResolvers = {
  TargetDetailGeneOntology: {
    rows: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ geneOntology }) => geneOntology.rows),
  },
};
