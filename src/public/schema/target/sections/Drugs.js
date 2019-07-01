import { gql } from 'apollo-server-express';

export const id = 'drugs';

export const summaryTypeDefs = gql`
  type TargetSummaryDrugs {
    drugCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryDrugs: {
    drugCount: ({ _ensgId }, args, { targetDrugsLoader }) =>
      targetDrugsLoader.load(_ensgId).then(({ drugCount }) => drugCount),
    sources: () => [{ name: 'ChEMBL', url: 'https://www.ebi.ac.uk/chembl/' }],
  },
};

export const sectionTypeDefs = gql`
  type TargetDetailDrugs {
    rows: [EvidenceRowDrugs!]!
  }
`;

export const sectionResolvers = {
  TargetDetailDrugs: {
    rows: ({ _ensgId }, args, { targetDrugsLoader }) =>
      targetDrugsLoader.load(_ensgId).then(({ rows }) => rows),
  },
};
