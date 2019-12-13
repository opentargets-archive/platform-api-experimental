import { gql } from 'apollo-server-express';

export const id = 'linkedDiseases';

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
        .then(({ indicationsCount }) => indicationsCount),
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
    rows: [Indication!]!
  }
`;

export const sectionResolvers = {
  DrugDetailLinkedDiseases: {
    rows: ({ _chemblId }, args, { drugLoader }) =>
      drugLoader.load(_chemblId).then(({ indications }) => {
        return indications.map(
          ({ efo_id, efo_label, max_phase_for_indication }) => {
            return {
              _efoId: efo_id, // needed for other resolvers
              id: efo_id,
              name: efo_label,
              maxPhase: max_phase_for_indication,
            };
          }
        );
      }),
  },
};
