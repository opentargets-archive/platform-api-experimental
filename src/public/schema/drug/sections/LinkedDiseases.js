import { gql } from 'apollo-server-express';

import { drugDiseases } from '../../../apis/openTargets';

import therapeuticAreasPerDisease from '../../disease/therapeuticAreasPerDisease';

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
      drugLoader.load(_chemblId).then(({ indications }) => indications.length),
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
      drugLoader
        .load(_chemblId)
        .then(({ name }) => drugDiseases(name))
        .then(rows =>
          rows.map(({ id, name }) => ({
            _efoId: id, // needed for other disease resolvers
            id,
            name,
          }))
        ),
  },
};
