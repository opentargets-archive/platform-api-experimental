import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum AssociationType {
    RESISTANT
    RESPONSIVE
    NOT_RESPONSIVE
    INCREASED_TOXICITY
  }
  type Source {
    url: String!
    name: String
  }
  type RowCancerBiomarkers {
    biomarker: String!
    diseases: [Disease!]!
    drugName: String!
    associationType: AssociationType!
    evidenceLevel: String!
    sources: [Source!]!
  }
  type TargetDetailCancerBiomarkers {
    rows: [RowCancerBiomarkers!]!
  }
`;

export const resolvers = {
  TargetDetailCancerBiomarkers: {
    rows: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ cancerBiomarkers }) => cancerBiomarkers.rows),
  },
};
