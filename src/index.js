import express from "express";
import { ApolloServer, gql } from "apollo-server-express";

import targetSummary from "./resolvers/targetSummary";
import diseaseSummary from "./resolvers/diseaseSummary";
import diseaseDAG from "./resolvers/diseaseDAG";

const typeDefs = gql`
  type Query {
    targetSummary(ensgId: String!): TargetSummary!
    diseaseSummary(efoId: String!): DiseaseSummary!
    diseaseDAG(efoId: String!): DiseaseDAG!
  }
  type TargetSummary {
    id: String!
    name: String!
    symbol: String!
    synonyms: [String!]!
    drugs: TargetSummaryDrugs!
    pathways: TargetSummaryPathways!
    cancerBiomarkers: TargetSummaryCancerBiomarkers!
    chemicalProbes: TargetSummaryChemicalProbes!
    protein: TargetSummaryProtein!
    similarTargets: TargetSummarySimilarTargets!
  }
  type DiseaseSummary {
    id: String!
    name: String!
    synonyms: [String!]!
  }
  type DiseaseDAG {
    nodes: [DiseaseDAGNode!]!
  }
  type DiseaseDAGNode {
    id: String!
    name: String!
    parentIds: [String!]
    nodeType: String!
  }
  type TargetSummaryDrugs {
    count: Int!
    modalities: TargetDrugModalitiesAgg!
    trialsByPhase: [TargetDrugTrialsByPhaseAgg!]!
  }
  type TargetDrugModalitiesAgg {
    antibody: Boolean!
    peptide: Boolean!
    protein: Boolean!
    smallMolecule: Boolean!
  }
  type TargetDrugTrialsByPhaseAgg {
    phase: Int!
    trialCount: Int!
  }
  type TargetSummaryPathways {
    count: Int!
  }
  type TargetSummaryCancerBiomarkers {
    count: Int!
    diseaseCount: Int!
  }
  type TargetSummaryChemicalProbes {
    portalProbeCount: Int!
    hasProbeMinerLink: Boolean!
  }
  type TargetSummaryProtein {
    hasProtVista: Boolean!
    subcellularLocation: [String!]
  }
  type TargetSummarySimilarTargets {
    count: Int!
    averageCommonDiseases: Int!
  }
`;

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
