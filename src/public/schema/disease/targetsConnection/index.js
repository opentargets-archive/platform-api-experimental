import { gql } from 'apollo-server-express';
import _ from 'lodash';

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
  input DiseaseTargetsConnectionFacetsInput {
    ${facets
      .filter(d => d.facetInputTypeDefs)
      .map(
        d => `${d.id}: DiseaseTargetsConnectionFacetInput${_.upperFirst(d.id)}`
      )
      .join('\n')}
  }
  type DiseaseTargetsConnectionFacets {
    ${facets
      .filter(d => d.facetTypeDefs)
      .map(d => `${d.id}: DiseaseTargetsConnectionFacet${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const targetsConnectionTypeDef = gql`
  # # graphql does not support unions of enums or input types,
  # # but we could consider how to refactor the following
  enum DiseaseTargetsConnectionSortByField {
    GENETIC_ASSOCIATION
    SOMATIC_MUTATION
    KNOWN_DRUGS
    PATHWAYS
    DIFFERENTIAL_EXPRESSION
    ANIMAL_MODELS
    TEXT_MINING
    SCORE_OVERALL
    DISEASE_NAME
  }
  input DiseaseTargetsConnectionSortByInput {
    field: DiseaseTargetsConnectionSortByField!
    ascending: Boolean!
  }
  # interface TargetDiseaseAssociation { # maybe add this when doing DiseaseTargetsConnectionEdge
  #   score: Float!
  #   scoresByDataType: [ScoreForDataType!]!
  #   scoresByDataSource: [ScoreForDataSource!]!
  # }
  type DiseaseTargetsConnectionEdge { #implements TargetDiseaseAssociation {
    id: String!
    node: Target!
    score: Float!
    scoresByDataType: [ScoreForDataType!]!
    scoresByDataSource: [ScoreForDataSource!]!
  }
  type DiseaseTargetsConnection {
    totalCount: Int!
    facets: DiseaseTargetsConnectionFacets!
    edges: [DiseaseTargetsConnectionEdge!]!
    pageInfo: PageInfo!
  }
`;
export const typeDefs = [
  ...facetsTypeDefs,
  ...facetsInputTypeDefs,
  facetsTypeDef,
  targetsConnectionTypeDef,
];

// merge resolvers
const facetsResolvers = facets
  .filter(d => d.facetResolvers)
  .map(d => d.facetResolvers);
const facetsResolver = {
  DiseaseTargetsConnectionFacets: facets
    .filter(d => d.facetResolvers)
    .reduce((acc, d) => {
      acc[d.id] = _.identity;
      return acc;
    }, {}),
};
const targetsConnectionResolver = {
  DiseaseTargetsConnection: {
    facets: ({ _ensgId, _data }) => ({ _ensgId, _facets: _data.facets }),
    totalCount: ({ _data }) => _data.totalCount,
    edges: ({ _data }) => _data.edges,
    pageInfo: ({ _data }) => _data.pageInfo,
  },
};
export const resolvers = _.merge(
  ...facetsResolvers,
  facetsResolver,
  targetsConnectionResolver
);
