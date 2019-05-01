import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TargetSummaryTractability {
    hasSmallMoleculeTractabilityAssessment: Boolean!
    hasAntibodyTractabilityAssessment: Boolean!
    sources: [Source!]!
  }
`;

export const resolvers = {
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
        name: 'ChEMBL',
        url: 'https://www.ebi.ac.uk/chembl/',
      },
    ],
  },
};
