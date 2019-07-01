import express from 'express';

import { typeDefs, resolvers } from './schema';

import {
  createTargetLoader,
  createExpressionLoader,
  createAtlasLoader,
  createGtexLoader,
  createTargetDrugsLoader,
  createDiseaseDrugsLoader,
  createDiseaseLoader,
  createDrugLoader,
} from './apis/dataloaders';

const apolloServerConfig = {
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    targetLoader: createTargetLoader(),
    expressionLoader: createExpressionLoader(),
    atlasLoader: createAtlasLoader(),
    gtexLoader: createGtexLoader(),
    diseaseLoader: createDiseaseLoader(),
    drugLoader: createDrugLoader(),
    targetDrugsLoader: createTargetDrugsLoader(),
    diseaseDrugsLoader: createDiseaseDrugsLoader(),
  }),
};

export default apolloServerConfig;
