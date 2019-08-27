import { gql } from 'apollo-server-express';
import _ from 'lodash';

// load facets
import * as facetsObject from './facetIndex';
const facets = Object.values(facetsObject);

// combine type defs
const facetsTypeDefs = facets
  .filter(d => d.facetTypeDefs)
  .map(d => d.facetTypeDefs);
const facetsTypeDef = gql`
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
export const typeDefs = [...facetsTypeDefs, facetsTypeDef, associationsTypeDef];

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
    facets: _.identity,
  },
};
export const resolvers = _.merge(
  ...facetsResolvers,
  facetsResolver,
  associationsResolver
);
