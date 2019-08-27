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

export const facetResolvers = {
  TargetAssociationsFacetTherapeuticArea: {
    items: ({ _ensgId }, args, { targetAssociationsFacetLoader }) =>
      targetAssociationsFacetLoader
        .load(_ensgId)
        .then(({ therapeuticArea }) => therapeuticArea.items),
  },
};
