import { gql } from "apollo-server-express";

import { bestStructure } from "../../apis/pdb";

export const typeDefs = gql`
  type TargetSummaryProtein {
    hasSequenceAnnotationVisualisation: Boolean!
    hasProteinStructure: Boolean!
    hasSubcellularLocation: Boolean!
    hasSubunitData: Boolean!
    hasUniprotKeywords: Boolean!
  }
`;

export const resolvers = {
  TargetSummaryProtein: {
    hasSequenceAnnotationVisualisation: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ protein }) => (protein.uniprotId ? true : false)),
    hasProteinStructure: (obj, args, { ensgId, targetLoader }) =>
      targetLoader.load(ensgId).then(({ protein }) => {
        if (protein.uniprotId) {
          return bestStructure(protein.uniprotId).then(pdbId =>
            pdbId ? true : false
          );
        } else {
          return false;
        }
      }),
    hasSubcellularLocation: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ protein }) =>
          protein.uniprotSubcellularLocation &&
          protein.uniprotSubcellularLocation.length > 0
            ? true
            : false
        ),
    hasSubunitData: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ protein }) =>
          protein.uniprotSubcellularLocation &&
          protein.uniprotSubcellularLocation.length > 0
            ? true
            : false
        ),
    hasUniprotKeywords: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ protein }) =>
          protein.uniprotKeywords && protein.uniprotKeywords.length > 0
            ? true
            : false
        ),
  },
};
