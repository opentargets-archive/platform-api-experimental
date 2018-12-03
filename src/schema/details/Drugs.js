import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum DrugActivity {
    AGONIST
    ANTAGONIST
    UP_OR_DOWN
  }
  enum DrugType {
    SMALL_MOLECULE
    PROTEIN
    ENZYME
    ANTIBODY
    OLIGOSACCHARIDE
    OLIGONUCLEOTIDE
    UNKNOWN
  }
  enum TrialStatus {
    ACTIVE_NOT_RECRUITING
    COMPLETED
    NOT_APPLICABLE
    NOT_YET_RECRUITING
    RECRUITING
    SUSPENDED
    TERMINATED
    UNKNOWN_STATUS
    WITHDRAWN
  }
  type Disease {
    id: String!
    name: String!
  }
  type Drug {
    id: String!
    name: String!
    # type: DrugType!
    # activity: DrugActivity!
  }
  type ClinicalTrial {
    phase: Int!
    # status: ClinicalTrialStatus
  }
  type EvidenceRowDrugs {
    target: Target!
    disease: Disease!
    drug: Drug!
    clinicalTrial: ClinicalTrial!
  }
  type TargetDetailDrugs {
    rows: [EvidenceRowDrugs!]!
  }
`;

export const resolvers = {
  TargetDetailDrugs: {
    rows: ({ _ensgId }, args, { targetDrugsLoader }) =>
      targetDrugsLoader.load(_ensgId).then(({ rows }) => rows),
  },
};
