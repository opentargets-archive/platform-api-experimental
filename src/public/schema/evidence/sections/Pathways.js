import { gql } from 'apollo-server-express';

import { evidencePathways } from '../../../apis/openTargets';

export const id = 'pathways';

export const summaryTypeDefs = gql`
  type EvidenceSummaryPathways {
    pathwayCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryPathways: {
    pathwayCount: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(
        ({ pathwayCount }) => pathwayCount
      ),
    sources: () => [
      {
        name: 'Reactome',
        url:
          'https://docs.targetvalidation.org/data-sources/affected-pathways#reactome',
      },
      {
        name: 'SLAPenrich',
        url:
          'https://docs.targetvalidation.org/data-sources/affected-pathways#slapenrich',
      },
      {
        name: 'PROGENy',
        url:
          'https://docs.targetvalidation.org/data-sources/affected-pathways#progeny',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  enum ReactomeActivity {
    GAIN_OF_FUNCTION
  }
  type EvidenceRowPathways {
    activity: ReactomeActivity
    disease: Disease!
    pathway: ReactomePathway!
    source: Source!
  }
  type EvidenceDetailPathways {
    rowsPathways: [EvidenceRowPathways!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailPathways: {
    rowsPathways: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(
        ({ rowsPathways }) => rowsPathways
      ),
  },
};
