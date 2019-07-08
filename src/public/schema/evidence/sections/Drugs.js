import { gql } from 'apollo-server-express';

import { evidenceDrugs } from '../../../apis/openTargets';

export const id = 'drugs';

export const summaryTypeDefs = gql`
  type EvidenceSummaryDrugs {
    drugCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryDrugs: {
    drugCount: ({ _ensgId, _efoId }) =>
      evidenceDrugs(_ensgId, _efoId).then(({ drugCount }) => drugCount),
    sources: () => [{ name: 'ChEMBL', url: 'https://www.ebi.ac.uk/chembl/' }],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceDetailDrugs {
    rows: [EvidenceRowDrugs!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailDrugs: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceDrugs(_ensgId, _efoId).then(({ rows }) => rows),
    // evidenceDrugsCount(_ensgId, _efoId),
  },
};
