import express from 'express';
import _ from 'lodash';

import { typeDefs as Query, resolvers as resolversQuery } from './schema/Query';

import {
  typeDefs as Target,
  resolvers as resolversTarget,
} from './schema/target/Target';

import {
  typeDefs as Disease,
  resolvers as resolversDisease,
} from './schema/disease/Disease';

import {
  createTargetLoader,
  createExpressionLoader,
  createAtlasLoader,
  createGtexLoader,
  createTargetDrugsLoader,
  createDiseaseLoader,
} from './apis/dataloaders';

const apolloServerConfig = {
  typeDefs: [...Query, ...Target, ...Disease],
  resolvers: _.merge(resolversQuery, resolversTarget, resolversDisease),
  context: ({ req }) => ({
    targetLoader: createTargetLoader(),
    expressionLoader: createExpressionLoader(),
    atlasLoader: createAtlasLoader(),
    gtexLoader: createGtexLoader(),
    diseaseLoader: createDiseaseLoader(),
    targetDrugsLoader: createTargetDrugsLoader(),
  }),
};

export default apolloServerConfig;
