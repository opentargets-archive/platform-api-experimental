import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type TargetSummaryChemicalProbes {
    hasStructuralGenomicsConsortium: Boolean!
    hasChemicalProbesPortal: Boolean!
    hasOpenScienceProbes: Boolean!
    hasProbeMiner: Boolean!
  }
`;

export const resolvers = {
  TargetSummaryChemicalProbes: {
    hasStructuralGenomicsConsortium: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(
          ({ chemicalProbes }) => chemicalProbes.hasStructuralGenomicsConsortium
        ),
    hasChemicalProbesPortal: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.hasChemicalProbesPortal),
    hasOpenScienceProbes: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.hasOpenScienceProbes),
    hasProbeMiner: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.hasProbeMiner),
  },
};
