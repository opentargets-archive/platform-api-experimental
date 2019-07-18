import { gql } from 'apollo-server-express';

import { drugDiseases } from '../../../apis/openTargets';

export const id = 'linkedDiseases';

// TODO: We should NOT use `drugDiseases`, which essentially looks for
//       evidence containing the drug name. There will be a new field
//       `indications` in the 19.09 drug index, which we should switch
//       to when available.

export const summaryTypeDefs = gql`
  type DrugSummaryLinkedDiseases {
    linkedDiseaseCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  DrugSummaryLinkedDiseases: {
    linkedDiseaseCount: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader
        .load(_chemblId)
        .then(({ name }) => drugDiseases(name))
        .then(diseases => diseases.length),
    sources: () => [
      {
        name: 'ChEMBL',
        url: 'https://www.ebi.ac.uk/chembl/',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type DrugDetailLinkedDiseases {
    rows: [Disease!]!
  }
`;

export const sectionResolvers = {
  DrugDetailLinkedDiseases: {
    rows: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ name }) => drugDiseases(name)),
  },
};
