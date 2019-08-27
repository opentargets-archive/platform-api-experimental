import { gql } from 'apollo-server-express';

export const id = 'dataTypeAndSource';

export const facetTypeDefs = gql`
  type NestedCategoryFacetItem {
    id: String!
    name: String!
    count: Int!
    children: [NestedCategoryFacetItem!]
  }
  type TargetAssociationsFacetDataTypeAndSource {
    items: [NestedCategoryFacetItem!]!
  }
`;

export const facetInputTypeDefs = gql`
  input TargetAssociationsFacetInputDataTypeAndSource {
    dataTypeIds: [String!]
    dataSourceIds: [String!]
  }
`;

export const facetResolvers = {
  TargetAssociationsFacetDataTypeAndSource: {
    items: ({ _facets }) => _facets.dataTypeAndSource.items,
  },
};
