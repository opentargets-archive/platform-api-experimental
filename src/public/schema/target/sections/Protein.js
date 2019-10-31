import { gql } from 'apollo-server-express';

export const id = 'protein';

export const summaryTypeDefs = gql`
  type TargetSummaryProtein {
    hasSubCellularLocation: Boolean!
    hasSubUnitData: Boolean!
    hasUniprotKeywords: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryProtein: {
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
    keywords: [UniprotKeyword!]
    subCellularLocations: [UniprotSubCellularLocation!]
    subUnit: [String!]
  }
`;

export const sectionResolvers = {
  TargetDetailProtein: {
    uniprotId: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => protein.uniprotId),
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
