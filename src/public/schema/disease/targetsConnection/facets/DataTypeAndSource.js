import { gql } from 'apollo-server-express';

export const id = 'dataTypeAndSource';

export const facetTypeDefs = gql`
  type DiseaseTargetsConnectionFacetDataTypeAndSource {
    items: [DataTypeFacetItem!]!
  }
`;

export const facetInputTypeDefs = gql`
  input DiseaseTargetsConnectionFacetInputDataTypeAndSource {
    dataTypeIds: [DataType!]
    dataSourceIds: [DataSource!]
  }
`;

export const facetResolvers = {
  DiseaseTargetsConnectionFacetDataTypeAndSource: {
    items: ({ _facets }) => _facets.dataTypeAndSource.items,
  },
};
