import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type CancerHallmarkPublication {
    pmId: String!
    description: String!
  }
  type CancerHallmarkPublicationsByHallmark {
    name: String!
    promotes: Boolean!
    suppresses: Boolean!
    publications: [CancerHallmarkPublication!]!
  }
  type TargetDetailCancerHallmarks {
    publicationsByHallmark: [CancerHallmarkPublicationsByHallmark!]!
    roleInCancer: [CancerHallmarkRoleInCancer!]!
  }
`;

export const resolvers = {
  TargetDetailCancerHallmarks: {
    publicationsByHallmark: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerHallmarks }) => cancerHallmarks.publicationsByHallmark),
    roleInCancer: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerHallmarks }) => cancerHallmarks.roleInCancer),
  },
};
