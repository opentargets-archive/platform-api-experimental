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
  type EvidenceSummaries {
    ${sections
      .map(d => `${d.id}: EvidenceSummary${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const sectionsTypeDef = gql`
  type EvidenceDetails {
    ${sections
      .map(d => `${d.id}: EvidenceDetail${_.upperFirst(d.id)}`)
      .join('\n')}
  }
`;
const evidenceTypeDef = gql`
  type Evidence {
    summaries: EvidenceSummaries!
    details: EvidenceDetails!
  }
`;
export const typeDefs = [
  ...summaryTypeDefs,
  ...sectionTypeDefs,
  summariesTypeDef,
  sectionsTypeDef,
  evidenceTypeDef,
];

// merge resolvers
const summariesResolvers = sections.map(d => d.summaryResolvers);
const sectionsResolvers = sections.map(d => d.sectionResolvers);
const summariesResolver = {
  EvidenceSummaries: sections.reduce((acc, d) => {
    acc[d.id] = _.identity;
    return acc;
  }, {}),
};
const sectionsResolver = {
  EvidenceDetails: sections.reduce((acc, d) => {
    acc[d.id] = _.identity;
    return acc;
  }, {}),
};
const evidenceResolver = {
  Evidence: {
    summaries: _.identity,
    details: _.identity,
  },
};
export const resolvers = _.merge(
  ...summariesResolvers,
  ...sectionsResolvers,
  summariesResolver,
  sectionsResolver,
  evidenceResolver
);
