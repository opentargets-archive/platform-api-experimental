import { gql } from 'apollo-server-express';
import _ from 'lodash';

import { targetDiseasesConnection } from '../../apis/openTargets';

// load diseases connection
import {
  typeDefs as diseasesConnectionTypeDefs,
  resolvers as diseasesConnectionResolvers,
} from './diseasesConnection';

// load sections
import * as sectionsObject from './sectionIndex';
const sections = Object.values(sectionsObject);

// combine type defs
const summaryTypeDefs = sections
  .filter(d => d.summaryTypeDefs)
  .map(d => d.summaryTypeDefs);
const sectionTypeDefs = sections
  .filter(d => d.sectionTypeDefs)
  .map(d => d.sectionTypeDefs);
const summariesTypeDef = gql`
  type TargetSummaries {
    ${sections
      .filter(d => d.summaryTypeDefs)
      .map(d => `${d.id}: TargetSummary${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const sectionsTypeDef = gql`
  type TargetDetails {
    ${sections
      .filter(d => d.sectionTypeDefs)
      .map(d => `${d.id}: TargetDetail${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const targetTypeDef = gql`
  type Target {
    id: String!
    uniprotId: String!
    symbol: String!
    name: String!
    description: String
    synonyms: [String!]!
    summaries: TargetSummaries!
    details: TargetDetails!
    diseasesConnection(
      facets: TargetDiseasesConnectionFacetsInput
      sortBy: TargetDiseasesConnectionSortByInput
      first: Int
      after: String
      search: String
    ): TargetDiseasesConnection!
  }
`;
export const typeDefs = [
  ...summaryTypeDefs,
  ...sectionTypeDefs,
  summariesTypeDef,
  sectionsTypeDef,
  ...diseasesConnectionTypeDefs,
  targetTypeDef,
];

// merge resolvers
const summariesResolvers = sections
  .filter(d => d.summaryResolvers)
  .map(d => d.summaryResolvers);
const sectionsResolvers = sections
  .filter(d => d.sectionResolvers)
  .map(d => d.sectionResolvers);
const summariesResolver = {
  TargetSummaries: sections
    .filter(d => d.summaryResolvers)
    .reduce((acc, d) => {
      acc[d.id] = _.identity;
      return acc;
    }, {}),
};
const sectionsResolver = {
  TargetDetails: sections
    .filter(d => d.sectionResolvers)
    .reduce((acc, d) => {
      acc[d.id] = _.identity;
      return acc;
    }, {}),
};
const targetResolver = {
  Target: {
    id: ({ _ensgId, id }, args, { targetLoader }) =>
      id ? id : targetLoader.load(_ensgId).then(({ id }) => id),
    uniprotId: ({ _ensgId, id }, args, { targetLoader }) =>
      id
        ? id
        : targetLoader.load(_ensgId).then(({ protein }) => protein.uniprotId),
    symbol: ({ _ensgId, symbol }, args, { targetLoader }) =>
      symbol ? symbol : targetLoader.load(_ensgId).then(({ symbol }) => symbol),
    name: ({ _ensgId, name }, args, { targetLoader }) =>
      name ? name : targetLoader.load(_ensgId).then(({ name }) => name),
    description: ({ _ensgId, description }, args, { targetLoader }) =>
      description
        ? description
        : targetLoader.load(_ensgId).then(({ description }) => description),
    synonyms: ({ _ensgId, synonyms }, args, { targetLoader }) =>
      synonyms
        ? synonyms
        : targetLoader.load(_ensgId).then(({ synonyms }) => synonyms),
    summaries: _.identity,
    details: _.identity,
    diseasesConnection: (
      { _ensgId },
      { facets, sortBy, search = '', first = 50, after = null }
    ) => {
      const { field: sortField, ascending: sortAscending = false } =
        sortBy || {};
      return targetDiseasesConnection(
        _ensgId,
        facets,
        search,
        sortField,
        sortAscending,
        first,
        after
      ).then(data => ({
        _ensgId,
        _data: data,
      }));
    },
  },
};
export const resolvers = _.merge(
  ...summariesResolvers,
  ...sectionsResolvers,
  summariesResolver,
  sectionsResolver,
  diseasesConnectionResolvers,
  targetResolver
);
