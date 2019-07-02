import { gql } from 'apollo-server-express';

export const id = 'cancerBiomarkers';

export const summaryTypeDefs = gql`
  type TargetSummaryCancerBiomarkers {
    hasCancerBiomarkers: Boolean!
    cancerBiomarkerCount: Int!
    diseaseCount: Int!
    drugCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryCancerBiomarkers: {
    hasCancerBiomarkers: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.hasCancerBiomarkers),
    cancerBiomarkerCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.cancerBiomarkerCount),
    diseaseCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.diseaseCount),
    drugCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.drugCount),
    sources: () => [
      {
        name: 'Cancer Genome Interpreter',
        url: 'https://www.cancergenomeinterpreter.org/biomarkers',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  enum AssociationType {
    RESISTANT
    RESPONSIVE
    NOT_RESPONSIVE
    INCREASED_TOXICITY
  }
  type Source {
    url: String!
    name: String
  }
  type RowCancerBiomarkers {
    biomarker: String!
    diseases: [Disease!]!
    drugName: String!
    associationType: AssociationType!
    evidenceLevel: String!
    sources: [Source!]!
  }
  type TargetDetailCancerBiomarkers {
    rows: [RowCancerBiomarkers!]!
  }
`;

export const sectionResolvers = {
  TargetDetailCancerBiomarkers: {
    rows: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.rows),
  },
};
