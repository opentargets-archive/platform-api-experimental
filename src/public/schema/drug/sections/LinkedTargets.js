import { gql } from 'apollo-server-express';

export const id = 'linkedTargets';

export const summaryTypeDefs = gql`
  type DrugSummaryLinkedTargets {
    linkedTargetCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  DrugSummaryLinkedTargets: {
    linkedTargetCount: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader
        .load(_chemblId)
        .then(({ linkedTargets }) => linkedTargets.length),
    sources: () => [
      {
        name: 'ChEMBL',
        url: 'https://www.ebi.ac.uk/chembl/',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type DrugDetailLinkedTargets {
    rows: [Target!]!
  }
`;

export const sectionResolvers = {
  DrugDetailLinkedTargets: {
    rows: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ linkedTargets }) => linkedTargets),
  },
};
