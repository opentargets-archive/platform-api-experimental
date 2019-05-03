import { gql } from 'apollo-server-express';

import { bestStructure } from '../../apis/pdb';
import { secondaryStructure } from '../../apis/uniprot';

export const typeDefs = gql`
  type Pdb {
    pdbId: String!
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
  type UniprotStructuralFeature {
    type: String!
    start: Int!
    end: Int!
  }
  type TargetDetailProtein {
    uniprotId: String
    pdbId: String
    pdbs: [Pdb!]!
    keywords: [UniprotKeyword!]
    subCellularLocations: [UniprotSubCellularLocation!]
    subUnit: [String!]
    structuralFeatures: [UniprotStructuralFeature!]!
    sequenceLength: Int
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
    structuralFeatures: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => {
        if (protein.uniprotId) {
          return secondaryStructure(protein.uniprotId).then(
            ({ features }) => features
          );
        } else {
          return [];
        }
      }),
    sequenceLength: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => {
        if (protein.uniprotId) {
          return secondaryStructure(protein.uniprotId).then(
            ({ length }) => length
          );
        } else {
          return null;
        }
      }),
  },
};
