import { gql } from 'apollo-server-express';

export const id = 'pathways';

export const facetTypeDefs = gql`
  type SinglyNestedCategoryFacetItem {
    itemId: String!
    name: String!
    count: Int!
    children: [CategoryFacetItem!]!
  }
  type DiseaseTargetsConnectionFacetPathways {
    items: [SinglyNestedCategoryFacetItem!]!
  }
`;

export const facetInputTypeDefs = gql`
  input DiseaseTargetsConnectionFacetInputPathways {
    pathwayIds: [String!]
  }
`;

export const facetResolvers = {
  DiseaseTargetsConnectionFacetPathways: {
    items: ({ _facets }) => _facets.pathways.items,
  },
};
