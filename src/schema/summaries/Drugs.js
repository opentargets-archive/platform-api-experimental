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
    drugCount: ({ _ensgId }, args, { targetDrugsLoader }) =>
      targetDrugsLoader.load(_ensgId).then(({ drugCount }) => drugCount),
    drugModalities: ({ _ensgId }, args, { targetDrugsLoader }) =>
      targetDrugsLoader
        .load(_ensgId)
        .then(({ drugModalities }) => drugModalities),
    trialsByPhase: ({ _ensgId }, args, { targetDrugsLoader }) =>
      targetDrugsLoader
        .load(_ensgId)
        .then(({ trialsByPhase }) => trialsByPhase),
  },
};
