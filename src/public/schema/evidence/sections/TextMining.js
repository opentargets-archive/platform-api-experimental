import { gql } from 'apollo-server-express';

import {
  evidenceTextMining,
  evidenceTextMiningSummary,
} from '../../../apis/openTargets';

export const id = 'textMining';

export const summaryTypeDefs = gql`
  type EvidenceSummaryTextMining {
    textMiningCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryTextMining: {
    textMiningCount: ({ _ensgId, _efoId }) =>
      evidenceTextMiningSummary(_ensgId, _efoId).then(
        ({ textMiningCount }) => textMiningCount
      ),
    sources: () => [
      {
        name: 'Europe PMC',
        url:
          'https://docs.targetvalidation.org/data-sources/text-mining#europe-pmc',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type Abstract {
    title: String!
  }

  type Author {
    firstName: String
    lastName: String
  }

  type Match {
    start: Int!
    end: Int!
  }

  type SectionMatch {
    text: String!
    section: String!
    target: Match
    disease: Match
  }

  type Publication {
    id: String!
    title: String!
    date: String!
    authors: [Author!]!
    url: String
    abstract: String
    matches: [[SectionMatch]]
  }

  type Journal {
    title: String!
    volume: String
    issue: String
    page: String
    year: Int
  }

  type EvidenceRowTextMining {
    access: String!
    disease: Disease!
    journal: Journal!
    publication: Publication!
  }
  type EvidenceDetailTextMining {
    rows: [EvidenceRowTextMining!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailTextMining: {
    rows: ({ _ensgId, _efoId, _from, _size }) =>
      evidenceTextMining(_ensgId, _efoId, _from, _size).then(
        ({ rows }) => rows
      ),
  },
};
