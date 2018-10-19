import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { target, disease } from "./apis/openTargets";

const typeDefs = gql`
  type Query {
    hello: String!
    disease(efoId: String!): Disease!
    diseaseDAG(efoId: String!): DiseaseDAG!
  }
  type Disease {
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
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
    disease: (_, { efoId }) => {
      return disease(efoId).then(response => {
        const { label: name, efo_synonyms: synonyms } = response.data;
        return { id: efoId, name, synonyms };
      });
    },
    diseaseDAG: (_, { efoId }) => {
      return disease(efoId).then(response => {
        // for some reason, path_codes and path_labels are not zipped
        const {
          path_codes: pathCodes,
          path_labels: pathLabels,
        } = response.data;
        const paths = pathCodes.map((cs, i) =>
          cs.map((c, j) => ({
            id: c,
            name: pathLabels[i][j],
          }))
        );

        // flatten to node list
        const nodesObj = paths.reduce((acc, p) => {
          const pReversed = p.reverse();
          pReversed.forEach(({ id, name }, i) => {
            // init node?
            if (!acc[id]) {
              acc[id] = {
                id,
                name,
                parentIds: [],
              };
            }
            if (i < pReversed.length - 1) {
              // add parent?
              const parentId = pReversed[i + 1].id;
              if (acc[id].parentIds.indexOf(parentId) < 0) {
                acc[id].parentIds.push(parentId);
              }
            }
          });
          return acc;
        }, {});
        const nodes = Object.values(nodesObj);

        return { nodes };
      });
    },
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
