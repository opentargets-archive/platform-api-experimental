import { gql } from 'apollo-server-express';

export const typeDefs = gql`
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

export const resolvers = {
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
