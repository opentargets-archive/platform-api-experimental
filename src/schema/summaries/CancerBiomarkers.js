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
    hasCancerBiomarkers: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.hasCancerBiomarkers),
    cancerBiomarkerCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.cancerBiomarkerCount),
    diseaseCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.diseaseCount),
    drugCount: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.drugCount),
  },
};
