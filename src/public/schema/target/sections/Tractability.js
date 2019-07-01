import { gql } from 'apollo-server-express';

export const id = 'tractability';

export const summaryTypeDefs = gql`
  type TargetSummaryTractability {
    hasSmallMoleculeTractabilityAssessment: Boolean!
    hasAntibodyTractabilityAssessment: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryTractability: {
    hasSmallMoleculeTractabilityAssessment: (
      { _ensgId },
      args,
      { targetLoader }
    ) =>
      targetLoader
        .load(_ensgId)
        .then(
          ({ tractability }) =>
            tractability.hasSmallMoleculeTractabilityAssessment
        ),
    hasAntibodyTractabilityAssessment: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(
          ({ tractability }) => tractability.hasAntibodyTractabilityAssessment
        ),
    sources: () => [
      {
        name: 'Open Targets',
        url:
          'https://docs.targetvalidation.org/getting-started/target-tractability',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type TractabilityAssessmentBucket {
    chemblBucket: Int!
    description: String!
    value: Boolean!
  }
  type TargetDetailTractability {
    smallMolecule: [TractabilityAssessmentBucket!]!
    antibody: [TractabilityAssessmentBucket!]!
  }
`;

export const sectionResolvers = {
  TargetDetailTractability: {
    smallMolecule: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ tractability }) => tractability.smallMolecule),
    antibody: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ tractability }) => tractability.antibody),
  },
};
