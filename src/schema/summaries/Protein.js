import { gql } from "apollo-server-express";

import { bestStructure } from "../../apis/pdb";

export const typeDefs = gql`
  type TargetSummaryProtein {
    hasSequenceAnnotationVisualisation: Boolean!
    hasProteinStructure: Boolean!
    hasSubCellularLocation: Boolean!
    hasSubUnitData: Boolean!
    hasUniprotKeywords: Boolean!
  }
`;

export const resolvers = {
  TargetSummaryProtein: {
    hasSequenceAnnotationVisualisation: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ protein }) => (protein.uniprotId ? true : false)),
    hasProteinStructure: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader.load(_ensgId).then(({ protein }) => {
        if (protein.uniprotId) {
          return bestStructure(protein.uniprotId).then(pdbId =>
            pdbId ? true : false
          );
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
  },
};
