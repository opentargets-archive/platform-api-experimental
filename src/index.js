import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import _ from 'lodash';

import apolloServerConfig from './public/apolloServerConfig';

const server = new ApolloServer(apolloServerConfig);

const app = express();
server.applyMiddleware({ app });

const port = process.env.PLATFORM_API_PORT || 8080;

app.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  )
);
