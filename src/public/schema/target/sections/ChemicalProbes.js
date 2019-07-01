import { gql } from 'apollo-server-express';

export const id = 'chemicalProbes';

export const summaryTypeDefs = gql`
  type TargetSummaryChemicalProbes {
    hasStructuralGenomicsConsortium: Boolean!
    hasChemicalProbesPortal: Boolean!
    hasOpenScienceProbes: Boolean!
    hasProbeMiner: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
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
      { name: 'SGC', url: 'https://www.thesgc.org/' },
      { name: 'Chemical Probes Portal', url: 'http://www.chemicalprobes.org/' },
      {
        name: 'Open Science Probes',
        url: 'http://www.sgc-ffm.uni-frankfurt.de/',
      },
      { name: 'Probe Miner', url: 'https://probeminer.icr.ac.uk/#/' },
    ],
  },
};

export const sectionTypeDefs = gql`
  type RowChemicalProbes {
    chemicalProbe: String!
    note: String
    sources: [Source!]!
  }
  type TargetDetailChemicalProbes {
    rows: [RowChemicalProbes!]!
    probeMinerUrl: String
  }
`;

export const sectionResolvers = {
  TargetDetailChemicalProbes: {
    rows: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.rows),
    probeMinerUrl: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.probeMinerUrl),
  },
};
