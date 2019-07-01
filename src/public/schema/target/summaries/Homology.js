import { gql } from 'apollo-server-express';

import { homologyTable } from '../../../apis/ensembl';

export const typeDefs = gql`
  type OrthologuesBySpecies {
    species: String!
    speciesId: String!
    orthologuesCount: Int!
  }
  type TargetSummaryHomology {
    paraloguesCount: Int!
    orthologuesBySpecies: [OrthologuesBySpecies!]!
    sources: [Source!]!
  }
`;

export const resolvers = {
  TargetSummaryHomology: {
    sources: () => [{ name: 'Ensembl', url: 'https://www.ensembl.org' }],
    orthologuesBySpecies: ({ _ensgId }, args, { targetLoader }) =>
      homologyTable(_ensgId).then(
        ({ orthologuesBySpecies }) => orthologuesBySpecies
      ),
    paraloguesCount: ({ _ensgId }, args, { targetLoader }) =>
      homologyTable(_ensgId).then(({ paraloguesCount }) => paraloguesCount),
  },
};
