import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type TargetSummaryChemicalProbes {
    hasStructuralGenomicsConsortium: Boolean!
    hasChemicalProbesPortal: Boolean!
    hasOpenScienceProbes: Boolean!
    hasProbeMiner: Boolean!
    sources: [Source!]!
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
    sources: () => [
      { name: "SGC", url: "https://www.thesgc.org/" },
      { name: "Chemical Probes Portal", url: "http://www.chemicalprobes.org/" },
      {
        name: "Open Science Probes",
        url: "http://www.sgc-ffm.uni-frankfurt.de/",
      },
      { name: "ProbeMiner", url: "https://probeminer.icr.ac.uk/#/" },
    ],
  },
};
