import _ from 'lodash';

import { typeDefs as Query, resolvers as resolversQuery } from './Query';
import { typeDefs as Common } from './common';
import { typeDefs as Target, resolvers as resolversTarget } from './target';
import { typeDefs as Disease, resolvers as resolversDisease } from './disease';
import { typeDefs as Drug, resolvers as resolversDrug } from './drug';

export const typeDefs = [...Query, ...Common, ...Target, ...Disease, ...Drug];
export const resolvers = _.merge(
  resolversQuery,
  resolversTarget,
  resolversDisease,
  resolversDrug
);
