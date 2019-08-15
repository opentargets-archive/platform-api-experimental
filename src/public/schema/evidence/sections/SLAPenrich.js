import { gql } from 'apollo-server-express';

import { evidencePathways } from '../../../apis/openTargets';

export const id = 'slapenrich';

export const summaryTypeDefs = gql`
  type EvidenceSummarySlapenrich {
    pathwayCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummarySlapenrich: {
    pathwayCount: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(
        ({ slapenrichCount }) => slapenrichCount
      ),
    sources: () => [
      {
        name: 'SLAPenrich',
        url:
          'https://docs.targetvalidation.org/data-sources/affected-pathways#slapenrich',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type EvidenceRowSlapenrich {
    disease: Disease!
    pathway: ReactomePathway!
    source: Source!
  }
  type EvidenceDetailSlapenrich {
    rows: [EvidenceRowSlapenrich!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailSlapenrich: {
    rows: ({ _ensgId, _efoId }) =>
      evidencePathways(_ensgId, _efoId).then(
        ({ rowsSlapenrich }) => rowsSlapenrich
      ),
  },
};
