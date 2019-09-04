import { gql } from 'apollo-server-express';

export const id = 'targetClass';

export const facetTypeDefs = gql`
  type DiseaseTargetsConnectionFacetTargetClass {
    items: [SinglyNestedCategoryFacetItem!]!
  }
`;

export const facetInputTypeDefs = gql`
  input DiseaseTargetsConnectionFacetInputTargetClass {
    targetClassIds: [String!]
  }
`;

export const facetResolvers = {
  DiseaseTargetsConnectionFacetTargetClass: {
    items: ({ _facets }) => _facets.targetClass.items,
  },
};
