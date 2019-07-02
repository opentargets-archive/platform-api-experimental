import { gql } from 'apollo-server-express';

export const id = 'cancerHallmarks';

export const summaryTypeDefs = gql`
  type CancerHallmarkPromotionAndSuppression {
    name: String!
    promotes: Boolean!
    suppresses: Boolean!
  }
  type CancerHallmarkRoleInCancer {
    name: String!
    pmId: String!
  }
  type TargetSummaryCancerHallmarks {
    promotionAndSuppressionByHallmark: [CancerHallmarkPromotionAndSuppression!]!
    roleInCancer: [CancerHallmarkRoleInCancer!]!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryCancerHallmarks: {
    promotionAndSuppressionByHallmark: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(
          ({ cancerHallmarks }) =>
            cancerHallmarks.promotionAndSuppressionByHallmark
        ),
    roleInCancer: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerHallmarks }) => cancerHallmarks.roleInCancer),
    sources: () => [
      {
        name: 'Cancer Gene Census',
        url: 'https://cancer.sanger.ac.uk/census#cl_search',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
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
  type CancerHallmarkPublicationFullDetails {
    name: String!
    promotes: Boolean!
    suppresses: Boolean!
    description: String!
    pmId: String!
  }
  type TargetDetailCancerHallmarks {
    publicationsByHallmark: [CancerHallmarkPublicationsByHallmark!]!
    roleInCancer: [CancerHallmarkRoleInCancer!]!
    rows: [CancerHallmarkPublicationFullDetails!]!
  }
`;

export const sectionResolvers = {
  TargetDetailCancerHallmarks: {
    publicationsByHallmark: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerHallmarks }) => cancerHallmarks.publicationsByHallmark),
    roleInCancer: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerHallmarks }) => cancerHallmarks.roleInCancer),
    rows: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerHallmarks }) => cancerHallmarks.rows),
  },
};
