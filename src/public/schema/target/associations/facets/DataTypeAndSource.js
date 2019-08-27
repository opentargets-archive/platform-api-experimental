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

export const facetResolvers = {
  TargetAssociationsFacetDataTypeAndSource: {
    items: ({ _ensgId }, args, { targetAssociationsFacetLoader }) =>
      targetAssociationsFacetLoader
        .load(_ensgId)
        .then(({ dataTypeAndSource }) => dataTypeAndSource.items),
  },
};
