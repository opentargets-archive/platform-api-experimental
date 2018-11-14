import fs from "fs";
import path from "path";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";

import targetSummary from "./resolvers/targetSummary";
import diseaseSummary from "./resolvers/diseaseSummary";
import diseaseDAG from "./resolvers/diseaseDAG";

// load the schema
const schemaFile = path.join(__dirname, "schema.gql");
const typeDefs = fs.readFileSync(schemaFile, "utf8");

// create resolver object (mirrors typeDefs)
const resolvers = {
  Query: {
    targetSummary,
    diseaseSummary,
    diseaseDAG,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

const port = 4000;

app.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  )
);
