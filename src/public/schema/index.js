import _ from 'lodash';

import { typeDefs as Query, resolvers as resolversQuery } from './Query';

import {
  typeDefs as Target,
  resolvers as resolversTarget,
} from './target/Target';

import {
  typeDefs as Disease,
  resolvers as resolversDisease,
} from './disease/Disease';

export const typeDefs = [...Query, ...Target, ...Disease];
export const resolvers = _.merge(
  resolversQuery,
  resolversTarget,
  resolversDisease
);
