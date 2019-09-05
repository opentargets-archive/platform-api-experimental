import { gql } from 'apollo-server-express';

export const id = 'tissueSpecificity';

export const facetTypeDefs = gql`
  type TissueSpecificityFacetItem {
    itemId: String!
    name: String!
    organs: [String!]!
    anatomicalSystems: [String!]!
  }
  type DiseaseTargetsConnectionFacetTissueSpecificity {
    items: [TissueSpecificityFacetItem!]! # note: counts are currently unreliable, so excluded, as in platform
  }
`;

export const facetInputTypeDefs = gql`
  input DiseaseTargetsConnectionFacetInputTissueSpecificity {
    tissueIds: [String!]
  }
`;

export const facetResolvers = {
  DiseaseTargetsConnectionFacetTissueSpecificity: {
    items: ({ _facets }) => _facets.tissueSpecificity.items,
  },
};
