import { gql } from "apollo-server-express";
import _ from "lodash";

import {
  typeDefs as TargetSummaries,
  resolvers as resolversTargetSummaries,
} from "./TargetSummaries";

import {
  typeDefs as TargetDetails,
  resolvers as resolversTargetDetails,
} from "./TargetDetails";

import {
  typeDefs as TargetDiseasesConnection,
  resolvers as resolversTargetDiseasesConnection,
} from "./TargetDiseasesConnection";

export const typeDefs = [
  ...TargetSummaries,
  ...TargetDetails,
  ...TargetDiseasesConnection,
  gql`
    # extend type Query {
    #   target: Target!
    # }
    type Target {
      id: String!
      symbol: String!
      name: String!
      description: String
      synonyms: [String!]!
      summaries: TargetSummaries!
      details: TargetDetails!
      diseasesConnection: TargetDiseasesConnection!
    }
  `,
];

export const resolvers = _.merge(
  resolversTargetSummaries,
  resolversTargetDetails,
  resolversTargetDiseasesConnection,
  {
    // Query: {
    //   target: () => ({}),
    // },
    Target: {
      id: ({ _ensgId, id }, args, { targetLoader }) =>
        id ? id : targetLoader.load(_ensgId).then(({ id }) => id),
      symbol: ({ _ensgId, symbol }, args, { targetLoader }) =>
        symbol
          ? symbol
          : targetLoader.load(_ensgId).then(({ symbol }) => symbol),
      name: ({ _ensgId, name }, args, { targetLoader }) =>
        name ? name : targetLoader.load(_ensgId).then(({ name }) => name),
      description: ({ _ensgId, description }, args, { targetLoader }) =>
        description
          ? description
          : targetLoader.load(_ensgId).then(({ description }) => description),
      synonyms: ({ _ensgId, synonyms }, args, { targetLoader }) =>
        synonyms
          ? synonyms
          : targetLoader.load(_ensgId).then(({ synonyms }) => synonyms),
      summaries: ({ _ensgId }) => ({ _ensgId }),
      details: ({ _ensgId }) => ({ _ensgId }),
      diseasesConnection: ({ _ensgId }) => ({ _ensgId }),
    },
  }
);
