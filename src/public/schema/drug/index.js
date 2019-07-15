import { gql } from 'apollo-server-express';
// import { print } from 'graphql/language/printer';
import _ from 'lodash';

// load sections
// import * as sectionsObject from './sectionIndex';
// const sections = Object.values(sectionsObject);

// combine type defs
// const summaryTypeDefs = sections.map(d => d.summaryTypeDefs);
// const sectionTypeDefs = sections.map(d => d.sectionTypeDefs);
// const summariesTypeDef = gql`
//   type DiseaseSummaries {
//     ${sections
//       .map(d => `${d.id}: DiseaseSummary${_.upperFirst(d.id)}`)
//       .join('\n')}
//   }
// `;
// const sectionsTypeDef = gql`
//   type DiseaseDetails {
//     ${sections
//       .map(d => `${d.id}: DiseaseDetail${_.upperFirst(d.id)}`)
//       .join('\n')}
//   }
// `;
const drugTypeDef = gql`
  type Drug {
    id: String!
    name: String!
    description: String!
    synonyms: [String!]!
    # summaries: DiseaseSummaries!
    # details: DiseaseDetails!
  }
`;
export const typeDefs = [
  // ...summaryTypeDefs,
  // ...sectionTypeDefs,
  // summariesTypeDef,
  // sectionsTypeDef,
  drugTypeDef,
];

// merge resolvers
// const summariesResolvers = sections.map(d => d.summaryResolvers);
// const sectionsResolvers = sections.map(d => d.sectionResolvers);
// const summariesResolver = {
//   DiseaseSummaries: sections.reduce((acc, d) => {
//     acc[d.id] = _.identity;
//     return acc;
//   }, {}),
// };
// const sectionsResolver = {
//   DiseaseDetails: sections.reduce((acc, d) => {
//     acc[d.id] = _.identity;
//     return acc;
//   }, {}),
// };
const drugResolver = {
  Drug: {
    id: ({ _chemblId, id }, args, { drugLoader }) =>
      id ? id : drugLoader.load(_chemblId).then(({ id }) => id),
    name: ({ _chemblId, name }, args, { drugLoader }) =>
      name ? name : drugLoader.load(_chemblId).then(({ name }) => name),
    // description: ({ _chemblId, description }, args, { drugLoader }) =>
    //   description
    //     ? description
    //     : drugLoader.load(_chemblId).then(({ description }) => description),
    synonyms: ({ _chemblId, synonyms }, args, { drugLoader }) =>
      synonyms
        ? synonyms
        : drugLoader.load(_chemblId).then(({ synonyms }) => synonyms),
    // summaries: _.identity,
    // details: _.identity,
  },
};
export const resolvers = _.merge(
  // ...summariesResolvers,
  // ...sectionsResolvers,
  // summariesResolver,
  // sectionsResolver,
  drugResolver
);