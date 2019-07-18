import { gql } from 'apollo-server-express';

export const id = 'mechanismsOfAction';

export const summaryTypeDefs = gql`
  type DrugSummaryMechanismsOfAction {
    uniqueActionTypes: [String!]!
    uniqueTargetTypes: [String!]!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  DrugSummaryMechanismsOfAction: {
    uniqueActionTypes: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ uniqueActionTypes }) => uniqueActionTypes),
    uniqueTargetTypes: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ uniqueTargetTypes }) => uniqueTargetTypes),
    sources: () => [
      {
        name: 'ChEMBL',
        url: 'https://www.ebi.ac.uk/chembl/',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type MechanismOfActionRow {
    mechanismOfAction: String!
    targetName: String!
    targets: [Target!]!
    references: [Source!]!
  }
  type DrugDetailMechanismsOfAction {
    rows: [MechanismOfActionRow!]!
  }
`;

export const sectionResolvers = {
  DrugDetailMechanismsOfAction: {
    rows: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ mechanismsOfAction }) => mechanismsOfAction),
  },
};
