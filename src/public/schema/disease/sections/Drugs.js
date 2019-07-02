import { gql } from 'apollo-server-express';

import { diseaseSimilar } from '../../../apis/openTargets';

export const id = 'drugs';

export const summaryTypeDefs = gql`
  type DiseaseSummaryDrugs {
    drugCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  DiseaseSummaryDrugs: {
    drugCount: ({ _efoId }, args, { diseaseDrugsLoader }) =>
      diseaseDrugsLoader.load(_efoId).then(({ drugCount }) => drugCount),
    sources: () => [{ name: 'ChEMBL', url: 'https://www.ebi.ac.uk/chembl/' }],
  },
};

export const sectionTypeDefs = gql`
  type DiseaseDetailDrugs {
    rows: [EvidenceRowDrugs!]!
  }
`;

export const sectionResolvers = {
  DiseaseDetailDrugs: {
    rows: ({ _efoId }, args, { diseaseDrugsLoader }) =>
      diseaseDrugsLoader.load(_efoId).then(({ rows }) => rows),
  },
};
