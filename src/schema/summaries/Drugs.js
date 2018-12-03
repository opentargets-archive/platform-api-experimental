import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type DrugModalityAggregation {
    antibody: Int!
    enzyme: Int!
    oligonucleotide: Int!
    oligosaccharide: Int!
    protein: Int!
    smallMolecule: Int!
    other: Int!
  }
  type DrugTrialsByPhaseAggregation {
    phase: Int!
    trialCount: Int!
  }
  type TargetSummaryDrugs {
    drugCount: Int!
    drugModalities: DrugModalityAggregation!
    trialsByPhase: [DrugTrialsByPhaseAggregation!]!
  }
`;

export const resolvers = {
  TargetSummaryDrugs: {
    drugCount: (obj, args, { ensgId, targetDrugsLoader }) =>
      targetDrugsLoader.load(ensgId).then(({ drugCount }) => drugCount),
    drugModalities: (obj, args, { ensgId, targetDrugsLoader }) =>
      targetDrugsLoader
        .load(ensgId)
        .then(({ drugModalities }) => drugModalities),
    trialsByPhase: (obj, args, { ensgId, targetDrugsLoader }) =>
      targetDrugsLoader.load(ensgId).then(({ trialsByPhase }) => trialsByPhase),
  },
};
