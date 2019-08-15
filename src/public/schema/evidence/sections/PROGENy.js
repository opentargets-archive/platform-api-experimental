import { gql } from 'apollo-server-express';

import { evidencePathways } from '../../../apis/openTargets';

export const id = 'progeny';

export const summaryTypeDefs = gql`
  type EvidenceSummaryProgeny {
    pathwayCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryProgeny: {
    pathwayCount: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(
        ({ progenyCount }) => progenyCount
      ),
    sources: () => [
      {
        name: 'PROGENy',
        url:
          'https://docs.targetvalidation.org/data-sources/affected-pathways#progeny',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowProgeny {
    disease: Disease!
    pathway: ReactomePathway!
    source: Source!
  }
  type EvidenceDetailProgeny {
    rows: [EvidenceRowProgeny!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailProgeny: {
    rows: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(({ rowsProgeny }) => rowsProgeny),
  },
};
