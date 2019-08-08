import { gql } from 'apollo-server-express';

import { evidenceGenomicsEngland } from '../../../apis/openTargets';

export const id = 'genomicsEngland';

export const summaryTypeDefs = gql`
  type EvidenceSummaryGenomicsEngland {
    hasPanel: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryGenomicsEngland: {
    hasPanel: ({ _ensgId, _efoId }) =>
      evidenceGenomicsEngland(_ensgId, _efoId).then(({ hasPanel }) => hasPanel),
    sources: () => [
      {
        name: 'GenomicsEngland',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#genomics-england-panelapp',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type GenomicsEnglandPanel {
    id: String!
    url: String!
  }
  type EvidenceRowGenomicsEngland {
    disease: Disease!
    panel: GenomicsEnglandPanel!
    source: Source
  }
  type EvidenceDetailGenomicsEngland {
    rows: [EvidenceRowGenomicsEngland!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailGenomicsEngland: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceGenomicsEngland(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
