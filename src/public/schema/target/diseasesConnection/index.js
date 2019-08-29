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
  input TargetDiseasesConnectionFacetsInput {
    ${facets
      .filter(d => d.facetInputTypeDefs)
      .map(
        d => `${d.id}: TargetDiseasesConnectionFacetInput${_.upperFirst(d.id)}`
      )
      .join('\n')}
  }
  type TargetDiseasesConnectionFacets {
    ${facets
      .filter(d => d.facetTypeDefs)
      .map(d => `${d.id}: TargetDiseasesConnectionFacet${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const diseasesConnectionTypeDef = gql`
  # # graphql does not support unions of enums or input types,
  # # but we could consider how to refactor the following
  enum TargetDiseasesConnectionSortByField {
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
  input TargetDiseasesConnectionSortByInput {
    field: TargetDiseasesConnectionSortByField!
    ascending: Boolean!
  }
  type ScoreForDataType {
    dataTypeId: DataType!
    score: Float!
  }
  type ScoreForDataSource {
    dataSourceId: DataSource!
    score: Float!
  }
  # interface TargetDiseaseAssociation { # maybe add this when doing DiseaseTargetsConnectionEdge
  #   score: Float!
  #   scoresByDataType: [ScoreForDataType!]!
  #   scoresByDataSource: [ScoreForDataSource!]!
  # }
  type TargetDiseasesConnectionEdge { #implements TargetDiseaseAssociation {
    id: String!
    node: Disease!
    score: Float!
    scoresByDataType: [ScoreForDataType!]!
    scoresByDataSource: [ScoreForDataSource!]!
  }
  type PageInfo {
    nextCursor: String
    hasNextPage: Boolean!
  }
  type TargetDiseasesConnection {
    totalCount: Int!
    facets: TargetDiseasesConnectionFacets!
    edges: [TargetDiseasesConnectionEdge!]!
    pageInfo: PageInfo!
  }
`;
export const typeDefs = [
  ...facetsTypeDefs,
  ...facetsInputTypeDefs,
  facetsTypeDef,
  diseasesConnectionTypeDef,
];

// merge resolvers
const facetsResolvers = facets
  .filter(d => d.facetResolvers)
  .map(d => d.facetResolvers);
const facetsResolver = {
  TargetDiseasesConnectionFacets: facets
    .filter(d => d.facetResolvers)
    .reduce((acc, d) => {
      acc[d.id] = _.identity;
      return acc;
    }, {}),
};
const diseasesConnectionResolver = {
  TargetDiseasesConnection: {
    facets: ({ _ensgId, _data }) => ({ _ensgId, _facets: _data.facets }),
    totalCount: ({ _data }) => _data.totalCount,
    edges: ({ _data }) => _data.edges,
    pageInfo: ({ _data }) => _data.pageInfo,
  },
};
export const resolvers = _.merge(
  ...facetsResolvers,
  facetsResolver,
  diseasesConnectionResolver
);
