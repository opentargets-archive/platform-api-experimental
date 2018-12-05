import fs from "fs";
import path from "path";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import _ from "lodash";

// import targetAssociations from "./resolvers/targetAssociations";
// import targetSummary from "./resolvers/targetSummary";
// import targetDetailDrugs from "./resolvers/targetDetailDrugs";
// import targetDetailCancerBiomarkers from "./resolvers/targetDetailCancerBiomarkers";
// import targetDetailPathways from "./resolvers/targetDetailPathways";
// import diseaseSummary from "./resolvers/diseaseSummary";
// import diseaseDAG from "./resolvers/diseaseDAG";
// import targetDetailChemicalProbes from "./resolvers/targetDetailChemicalProbes.js";

import {
  typeDefs as Target,
  resolvers as resolversTarget,
} from "./schema/Target";

import {
  typeDefs as Disease,
  resolvers as resolversDisease,
} from "./schema/Disease";

import {
  createTargetLoader,
  createTargetDrugsLoader,
  createDiseaseLoader,
} from "./apis/dataloaders";

// load the schema
const schemaFile = path.join(__dirname, "schema.gql");
const typeDefs = fs.readFileSync(schemaFile, "utf8");

// create resolver object (mirrors typeDefs)
const resolvers = {
  Query: {
    // targetAssociations,
    // targetSummary,
    // targetDetailDrugs,
    // targetDetailCancerBiomarkers,
    // targetDetailPathways,
    // diseaseSummary,
    // diseaseDAG,
    // targetDetailChemicalProbes,
    target: (obj, { ensgId }) => ({ _ensgId: ensgId }),
    disease: (obj, { efoId }) => ({ _efoId: efoId }),
  },
};

const server = new ApolloServer({
  typeDefs: [typeDefs, ...Target, ...Disease],
  resolvers: _.merge(resolvers, resolversTarget, resolversDisease),
  context: ({ req }) => ({
    targetLoader: createTargetLoader(),
    diseaseLoader: createDiseaseLoader(),
    targetDrugsLoader: createTargetDrugsLoader(),
  }),
});

const app = express();
server.applyMiddleware({ app });

const port = 4000;

app.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  )
);
