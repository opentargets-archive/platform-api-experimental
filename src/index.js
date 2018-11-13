import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import _ from "lodash";
import { target, targetDrugs, disease } from "./apis/openTargets";

const typeDefs = gql`
  type Query {
    target(ensgId: String!): Target!
    targetSummary(ensgId: String!): TargetSummary!
    disease(efoId: String!): Disease!
    diseaseDAG(efoId: String!): DiseaseDAG!
  }
  type Target {
    id: String!
    name: String!
    symbol: String!
    synonyms: [String!]!
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
`;

const resolvers = {
  Query: {
    target: (obj, { ensgId }) => {
      return target(ensgId).then(response => {
        const {
          approved_symbol: symbol,
          approved_name: name,
          symbol_synonyms: symbolSynonyms,
          name_synonyms: nameSynonyms,
        } = response.data;
        return {
          id: ensgId,
          name,
          symbol,
          synonyms: [...symbolSynonyms, ...nameSynonyms],
        };
      });
    },
    targetSummary: (obj, { ensgId }) => {
      return Promise.all([target(ensgId), targetDrugs(ensgId)]).then(
        ([targetResponse, targetDrugsResponse]) => {
          const {
            approved_symbol: symbol,
            approved_name: name,
            symbol_synonyms: symbolSynonyms,
            name_synonyms: nameSynonyms,
            reactome,
            cancerbiomarkers: cancerBiomarkers,
            chemicalprobes: chemicalProbes,
          } = targetResponse.data;

          const drugCount = _.uniq(
            targetDrugsResponse.data.data.map(d => d.drug.molecule_name)
          ).length;
          const drugModalities = targetDrugsResponse.data.data.reduce(
            (acc, d) => {
              if (d.drug.molecule_type) {
                switch (d.drug.molecule_type.toLowerCase()) {
                  case "antibody":
                    acc.antibody = true;
                    break;
                  case "peptide":
                    acc.peptide = true;
                    break;
                  case "protein":
                    acc.protein = true;
                    break;
                  case "small molecule":
                    acc.smallMolecule = true;
                    break;
                }
              }
              return acc;
            },
            {
              antibody: false,
              peptide: false,
              protein: false,
              smallMolecule: false,
            }
          );
          const drugTrialsByPhase = targetDrugsResponse.data.data
            .reduce(
              (acc, d) => {
                acc[
                  d.evidence.drug2clinic.max_phase_for_disease.numeric_index
                ] += 1;
                return acc;
              },
              [0, 0, 0, 0, 0]
            )
            .map((d, i) => ({ phase: i, trialCount: d }));

          return {
            id: ensgId,
            name,
            symbol,
            synonyms: [...symbolSynonyms, ...nameSynonyms],
            pathways: {
              count: reactome.length,
            },
            cancerBiomarkers: {
              count: cancerBiomarkers
                ? _.uniq(cancerBiomarkers.map(d => d.biomarker)).length
                : 0,
              diseaseCount: cancerBiomarkers
                ? _.uniq(
                    cancerBiomarkers.reduce((acc, d) => {
                      return acc.concat(d.diseases.map(d2 => d2.id));
                    }, [])
                  ).length
                : 0,
            },
            chemicalProbes: {
              portalProbeCount:
                chemicalProbes && chemicalProbes.portalprobes
                  ? chemicalProbes.portalprobes.length
                  : 0,
              hasProbeMinerLink:
                chemicalProbes && chemicalProbes.probeminer ? true : false,
            },
            drugs: {
              count: drugCount,
              modalities: drugModalities,
              trialsByPhase: drugTrialsByPhase,
            },
          };
        }
      );
    },
    disease: (obj, { efoId }) => {
      return disease(efoId).then(response => {
        const { label: name, efo_synonyms: synonyms } = response.data;
        return { id: efoId, name, synonyms };
      });
    },
    diseaseDAG: (obj, { efoId }) => {
      return disease(efoId).then(response => {
        // for some reason, path_codes and path_labels are not zipped
        const {
          path_codes: pathCodes,
          path_labels: pathLabels,
          children,
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
                nodeType: id === efoId ? "base" : "parent",
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

        const childrenObj = children.reduce((acc, d) => {
          acc[d.code] = {
            id: d.code,
            name: d.label,
            parentIds: [efoId],
            nodeType: "child",
          };
          return acc;
        }, {});
        const nodes = [
          ...Object.values(nodesObj),
          ...Object.values(childrenObj),
        ];

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
