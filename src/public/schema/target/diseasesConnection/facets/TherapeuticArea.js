import { gql } from 'apollo-server-express';

export const id = 'therapeuticArea';

export const facetTypeDefs = gql`
  type CategoryFacetItem {
    id: String!
    name: String!
    count: Int!
  }
  type TargetDiseasesConnectionFacetTherapeuticArea {
    items: [CategoryFacetItem!]!
  }
`;

export const facetInputTypeDefs = gql`
  input TargetDiseasesConnectionFacetInputTherapeuticArea {
    efoIds: [String!]!
  }
`;

export const facetResolvers = {
  TargetDiseasesConnectionFacetTherapeuticArea: {
    items: ({ _facets }) => _facets.therapeuticArea.items,
  },
};
