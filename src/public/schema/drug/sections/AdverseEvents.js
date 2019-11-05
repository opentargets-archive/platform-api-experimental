import { gql } from 'apollo-server-express';

export const id = 'adverseEvents';

export const summaryTypeDefs = gql`
  type DrugSummaryAdverseEvents {
    eventsCount: Int!
    critval: Float!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  DrugSummaryAdverseEvents: {
    eventsCount: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader
        .load(_chemblId)
        .then(({ adverseEvents }) => adverseEvents.significant.length),
    critval: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader
        .load(_chemblId)
        .then(({ adverseEvents }) => adverseEvents.critval),
    sources: () => [
      {
        name: 'ChEMBL',
        url: 'https://www.ebi.ac.uk/chembl/',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type DrugDetailAdverseEvents {
    critval: Float!
    rows: [AdverseEventRow!]!
  }
  type AdverseEventRow {
    event: String!
    count: Int!
    llr: Float!
  }
`;

export const sectionResolvers = {
  DrugDetailAdverseEvents: {
    critval: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader
        .load(_chemblId)
        .then(({ adverseEvents }) => adverseEvents.critval),
    rows: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader
        .load(_chemblId)
        .then(({ adverseEvents }) => adverseEvents.significant),
  },
};
