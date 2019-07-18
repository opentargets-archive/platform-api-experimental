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
  type DrugSummaries {
    ${sections
      .map(d => `${d.id}: DrugSummary${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const sectionsTypeDef = gql`
  type DrugDetails {
    ${sections
      .map(d => `${d.id}: DrugDetail${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const drugTypeDef = gql`
  type Drug {
    id: String!
    name: String!
    synonyms: [String!]!
    tradeNames: [String!]!
    yearOfFirstApproval: String
    type: String!
    maximumClinicalTrialPhase: Int
    summaries: DrugSummaries!
    details: DrugDetails!
  }
`;
export const typeDefs = [
  ...summaryTypeDefs,
  ...sectionTypeDefs,
  summariesTypeDef,
  sectionsTypeDef,
  drugTypeDef,
];

// merge resolvers
const summariesResolvers = sections.map(d => d.summaryResolvers);
const sectionsResolvers = sections.map(d => d.sectionResolvers);
const summariesResolver = {
  DrugSummaries: sections.reduce((acc, d) => {
    acc[d.id] = _.identity;
    return acc;
  }, {}),
};
const sectionsResolver = {
  DrugDetails: sections.reduce((acc, d) => {
    acc[d.id] = _.identity;
    return acc;
  }, {}),
};
const drugResolver = {
  Drug: {
    id: ({ _chemblId, id }, args, { drugLoader }) =>
      id ? id : drugLoader.load(_chemblId).then(({ id }) => id),
    name: ({ _chemblId, name }, args, { drugLoader }) =>
      name ? name : drugLoader.load(_chemblId).then(({ name }) => name),
    synonyms: ({ _chemblId, synonyms }, args, { drugLoader }) =>
      synonyms
        ? synonyms
        : drugLoader.load(_chemblId).then(({ synonyms }) => synonyms),
    maximumClinicalTrialPhase: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ maximumClinicalTrialPhase }) => maximumClinicalTrialPhase),
    type: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ type }) => type),
    yearOfFirstApproval: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ yearOfFirstApproval }) => yearOfFirstApproval),
    tradeNames: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ tradeNames }) => tradeNames),
    summaries: _.identity,
    details: _.identity,
  },
};
export const resolvers = _.merge(
  ...summariesResolvers,
  ...sectionsResolvers,
  summariesResolver,
  sectionsResolver,
  drugResolver
);
