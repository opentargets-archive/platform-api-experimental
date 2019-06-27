import { gql } from 'apollo-server-express';
import _ from 'lodash';

export const typeDefs = [
  gql`
    # extend type Query {
    #   disease: Disease!
    # }
    type Disease {
      id: String!
      name: String!
      description: String!
      synonyms: [String!]!
      therapeuticAreas: [Disease!]!
    }
  `,
];

export const resolvers = _.merge(
  {},
  {
    // Query: {
    //   disease: () => ({}),
    // },
    Disease: {
      id: ({ _efoId, id }, args, { diseaseLoader }) =>
        id ? id : diseaseLoader.load(_efoId).then(({ id }) => id),
      name: ({ _efoId, name }, args, { diseaseLoader }) =>
        name ? name : diseaseLoader.load(_efoId).then(({ name }) => name),
      description: ({ _efoId, description }, args, { diseaseLoader }) =>
        description
          ? description
          : diseaseLoader.load(_efoId).then(({ description }) => description),
      synonyms: ({ _efoId, synonyms }, args, { diseaseLoader }) =>
        synonyms
          ? synonyms
          : diseaseLoader.load(_efoId).then(({ synonyms }) => synonyms),
      therapeuticAreas: (
        { _efoId, therapeuticAreas },
        args,
        { diseaseLoader }
      ) =>
        therapeuticAreas
          ? therapeuticAreas
          : diseaseLoader
              .load(_efoId)
              .then(({ therapeuticAreas }) => therapeuticAreas),
    },
  }
);
