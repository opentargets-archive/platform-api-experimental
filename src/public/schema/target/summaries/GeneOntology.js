import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TargetSummaryGeneOntology {
    molecularFunctionTermsCount: Int!
    biologicalProcessTermsCount: Int!
    cellularComponentTermsCount: Int!
    sources: [Source!]!
  }
`;

export const resolvers = {
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
