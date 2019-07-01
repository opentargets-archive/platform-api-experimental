import { gql } from 'apollo-server-express';
// import { print } from 'graphql/language/printer';
import _ from 'lodash';

// load sections
import * as sectionsObject from './sectionIndex';
const sections = Object.values(sectionsObject);

// combine type defs
const summaryTypeDefs = sections.map(d => d.summaryTypeDefs);
const sectionTypeDefs = sections.map(d => d.sectionTypeDefs);
const summariesTypeDef = gql`
  type TargetSummaries {
    ${sections
      .map(d => `${d.id}: TargetSummary${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const sectionsTypeDef = gql`
  type TargetDetails {
    ${sections
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
  }
`;
export const typeDefs = [
  ...summaryTypeDefs,
  ...sectionTypeDefs,
  summariesTypeDef,
  sectionsTypeDef,
  targetTypeDef,
];

// merge resolvers
const summariesResolvers = sections.map(d => d.summaryResolvers);
const sectionsResolvers = sections.map(d => d.sectionResolvers);
const summariesResolver = {
  TargetSummaries: sections.reduce((acc, d) => {
    acc[d.id] = _.identity;
    return acc;
  }, {}),
};
const sectionsResolver = {
  TargetDetails: sections.reduce((acc, d) => {
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
  },
};
export const resolvers = _.merge(
  ...summariesResolvers,
  ...sectionsResolvers,
  summariesResolver,
  sectionsResolver,
  targetResolver
);
