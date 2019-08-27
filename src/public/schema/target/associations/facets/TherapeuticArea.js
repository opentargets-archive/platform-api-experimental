import { gql } from 'apollo-server-express';

export const id = 'therapeuticArea';

export const facetTypeDefs = gql`
  type CategoryFacetItem {
    id: String!
    name: String!
    count: Int!
  }
  type TargetAssociationsFacetTherapeuticArea {
    items: [CategoryFacetItem!]!
  }
`;

export const facetInputTypeDefs = gql`
  input TargetAssociationsFacetInputTherapeuticArea {
    efoIds: [String!]!
  }
`;

export const facetResolvers = {
  TargetAssociationsFacetTherapeuticArea: {
    items: ({ _facets }) => _facets.therapeuticArea.items,
  },
};
