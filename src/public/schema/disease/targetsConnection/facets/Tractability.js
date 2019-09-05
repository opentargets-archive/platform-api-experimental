import { gql } from 'apollo-server-express';

export const id = 'tractability';

export const facetTypeDefs = gql`
  type DiseaseTargetsConnectionFacetTractability {
    items: [CategoryFacetItem!]!
  }
`;

export const facetInputTypeDefs = gql`
  input DiseaseTargetsConnectionFacetInputTractability {
    tractabilityIds: [String!]
  }
`;

export const facetResolvers = {
  DiseaseTargetsConnectionFacetTractability: {
    items: ({ _facets }) => _facets.tractability.items,
  },
};
