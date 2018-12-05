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
    hasStructuralGenomicsConsortium: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(
          ({ chemicalProbes }) => chemicalProbes.hasStructuralGenomicsConsortium
        ),
    hasChemicalProbesPortal: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.hasChemicalProbesPortal),
    hasOpenScienceProbes: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.hasOpenScienceProbes),
    hasProbeMiner: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.hasProbeMiner),
  },
};
