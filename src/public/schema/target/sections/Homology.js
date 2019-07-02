import { gql } from 'apollo-server-express';

import { homologyTable } from '../../../apis/ensembl';

export const id = 'homology';

export const summaryTypeDefs = gql`
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

export const summaryResolvers = {
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

export const sectionTypeDefs = gql`
  type HomologyRow {
    dNdS: Float
    species: String!
    speciesId: String!
    homologyType: String!
    queryPercentageIdentity: Float!
    targetPercentageIdentity: Float!
    targetGeneId: String!
    targetGeneSymbol: String
  }
  type TargetDetailHomology {
    rows: [HomologyRow!]!
  }
`;

export const sectionResolvers = {
  TargetDetailHomology: {
    rows: ({ _ensgId }, args, { targetLoader }) =>
      homologyTable(_ensgId).then(({ rows }) => rows),
  },
};
