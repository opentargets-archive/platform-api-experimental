import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TargetSummaryHomology {
    sources: [Source!]!
  }
`;

export const resolvers = {
  TargetSummaryHomology: {
    sources: () => [{ name: 'Ensembl', url: 'https://www.ensembl.org' }],
  },
};
