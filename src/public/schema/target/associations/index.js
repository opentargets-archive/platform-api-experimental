import { gql } from 'apollo-server-express';
import _ from 'lodash';

import { targetAssociationsFacets } from '../../../apis/openTargets';

// load facets
import * as facetsObject from './facetIndex';
const facets = Object.values(facetsObject);

// combine type defs
const facetsTypeDefs = facets
  .filter(d => d.facetTypeDefs)
  .map(d => d.facetTypeDefs);
const facetsInputTypeDefs = facets
  .filter(d => d.facetInputTypeDefs)
  .map(d => d.facetInputTypeDefs);
const facetsTypeDef = gql`
  input TargetAssociationsFacetsInput {
    ${facets
      .filter(d => d.facetInputTypeDefs)
      .map(d => `${d.id}: TargetAssociationsFacetInput${_.upperFirst(d.id)}`)
      .join('\n')}
  }
  type TargetAssociationsFacets {
    ${facets
      .filter(d => d.facetTypeDefs)
      .map(d => `${d.id}: TargetAssociationsFacet${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const associationsTypeDef = gql`
  type TargetAssociations {
    facets: TargetAssociationsFacets!
  }
`;
export const typeDefs = [
  ...facetsTypeDefs,
  ...facetsInputTypeDefs,
  facetsTypeDef,
  associationsTypeDef,
];

// merge resolvers
const facetsResolvers = facets
  .filter(d => d.facetResolvers)
  .map(d => d.facetResolvers);
const facetsResolver = {
  TargetAssociationsFacets: facets
    .filter(d => d.facetResolvers)
    .reduce((acc, d) => {
      acc[d.id] = _.identity;
      return acc;
    }, {}),
};
const associationsResolver = {
  TargetAssociations: {
    facets: ({ _ensgId, _assocsArgs }) =>
      targetAssociationsFacets(_ensgId, _assocsArgs.facets).then(facets => ({
        _ensgId,
        _assocsArgs,
        _facets: facets,
      })),
  },
};
export const resolvers = _.merge(
  ...facetsResolvers,
  facetsResolver,
  associationsResolver
);
