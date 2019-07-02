import { gql } from 'apollo-server-express';

import { bestStructure } from '../../../apis/pdb';
import { secondaryStructure } from '../../../apis/uniprot';

export const id = 'protein';

export const summaryTypeDefs = gql`
  type TargetSummaryProtein {
    hasSequenceAnnotationVisualisation: Boolean!
    hasProteinStructure: Boolean!
    hasSubCellularLocation: Boolean!
    hasSubUnitData: Boolean!
    hasUniprotKeywords: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryProtein: {
    hasSequenceAnnotationVisualisation: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ protein }) => (protein.uniprotId ? true : false)),
    hasProteinStructure: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => {
        if (protein.uniprotId) {
          return bestStructure(protein.uniprotId)
            .then(({ pdbId }) => (pdbId ? true : false))
            .catch(error => {
              return false;
            });
        } else {
          return false;
        }
      }),
    hasSubCellularLocation: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ protein }) =>
          protein.uniprotSubCellularLocations &&
          protein.uniprotSubCellularLocations.length > 0
            ? true
            : false
        ),
    hasSubUnitData: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ protein }) =>
          protein.uniprotSubUnit && protein.uniprotSubUnit.length > 0
            ? true
            : false
        ),
    hasUniprotKeywords: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ protein }) =>
          protein.uniprotKeywords && protein.uniprotKeywords.length > 0
            ? true
            : false
        ),
    sources: () => [
      { name: 'UniProt', url: 'https://www.uniprot.org/' },
      { name: 'PDBe', url: 'https://www.ebi.ac.uk/pdbe/' },
    ],
  },
};

export const sectionTypeDefs = gql`
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

export const sectionResolvers = {
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
