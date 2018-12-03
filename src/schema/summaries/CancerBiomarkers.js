import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type TargetSummaryCancerBiomarkers {
    hasCancerBiomarkers: Boolean!
    cancerBiomarkerCount: Int!
    diseaseCount: Int!
    drugCount: Int!
  }
`;

export const resolvers = {
  TargetSummaryCancerBiomarkers: {
    hasCancerBiomarkers: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.hasCancerBiomarkers),
    cancerBiomarkerCount: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.cancerBiomarkerCount),
    diseaseCount: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.diseaseCount),
    drugCount: (obj, args, { ensgId, targetLoader }) =>
      targetLoader
        .load(ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.drugCount),
  },
};
