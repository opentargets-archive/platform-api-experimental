import { gql } from "apollo-server-express";

import { bestStructure } from "../../apis/pdb";

export const typeDefs = gql`
  type Pdb {
    id: String!
    chain: String
    start: Int!
    end: Int!
    coverage: Float!
    resolution: Float
    method: String!
  }
  type UniprotSubCellularLocation {
    id: String!
    name: String!
    description: String!
  }
  type UniprotKeyword {
    id: String!
    name: String!
    category: String!
  }
  type TargetDetailProtein {
    uniprotId: String
    pdbId: String
    pdbs: [Pdb!]!
    keywords: [UniprotKeyword!]
    subCellularLocations: [UniprotSubCellularLocation!]
    subUnit: [String!]
  }
`;

export const resolvers = {
  TargetDetailProtein: {
    uniprotId: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => protein.uniprotId),
    pdbId: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => {
        if (protein.uniprotId) {
          return bestStructure(protein.uniprotId).then(({ pdbId }) =>
            pdbId ? pdbId : null
          );
        } else {
          return null;
        }
      }),
    pdbs: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => {
        if (protein.uniprotId) {
          return bestStructure(protein.uniprotId).then(
            ({ pdbEntries }) => pdbEntries
          );
        } else {
          return [];
        }
      }),
    keywords: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => protein.uniprotKeywords),
    subCellularLocations: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ protein }) => protein.uniprotSubCellularLocations),
    subUnit: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => protein.uniprotSubUnit),
  },
};
