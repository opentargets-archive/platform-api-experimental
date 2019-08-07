import { gql } from 'apollo-server-express';

import { evidencePathways } from '../../../apis/openTargets';

export const id = 'reactome';

export const summaryTypeDefs = gql`
  type EvidenceSummaryReactome {
    pathwayCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryReactome: {
    pathwayCount: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(
        ({ reactomeCount }) => reactomeCount
      ),
    sources: () => [
      {
        name: 'Reactome',
        url:
          'https://docs.targetvalidation.org/data-sources/affected-pathways#reactome',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  enum ReactomeActivity {
    DECREASED_TRANSCRIPT_LEVEL
    GAIN_OF_FUNCTION
    LOSS_OF_FUNCTION
    PARTIAL_LOSS_OF_FUNCTION
    UP_OR_DOWN
  }
  type EvidenceRowReactome {
    activity: ReactomeActivity
    disease: Disease!
    pathway: ReactomePathway!
    mutations: [String!]!
    source: Source!
  }
  type EvidenceDetailReactome {
    rows: [EvidenceRowReactome!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailReactome: {
    rows: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(
        ({ rowsReactome }) => rowsReactome
      ),
  },
};
