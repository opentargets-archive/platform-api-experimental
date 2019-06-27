import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import _ from 'lodash';

import apolloServerConfig from './public/apolloServerConfig';

// import { typeDefs as Query, resolvers as resolversQuery } from './public/schema/Query';

// import {
//   typeDefs as Target,
//   resolvers as resolversTarget,
// } from './schema/Target';

// import {
//   typeDefs as Disease,
//   resolvers as resolversDisease,
// } from './public/schema/disease/Disease';

// import {
//   createTargetLoader,
//   createExpressionLoader,
//   createAtlasLoader,
//   createGtexLoader,
//   createTargetDrugsLoader,
//   createDiseaseLoader,
// } from './apis/dataloaders';

// const server = new ApolloServer({
//   typeDefs: [...Query, ...Target, ...Disease],
//   resolvers: _.merge(resolversQuery, resolversTarget, resolversDisease),
//   context: ({ req }) => ({
//     targetLoader: createTargetLoader(),
//     expressionLoader: createExpressionLoader(),
//     atlasLoader: createAtlasLoader(),
//     gtexLoader: createGtexLoader(),
//     diseaseLoader: createDiseaseLoader(),
//     targetDrugsLoader: createTargetDrugsLoader(),
//   }),
// });

const server = new ApolloServer(apolloServerConfig);

const app = express();
server.applyMiddleware({ app });

const port = process.env.PLATFORM_API_PORT || 8080;

app.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  )
);
