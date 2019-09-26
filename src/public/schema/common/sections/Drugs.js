import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  enum DrugActivity {
    AGONIST
    ANTAGONIST
    UP_OR_DOWN
    OTHER
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
  enum ClinicalTrialStatus {
    ACTIVE_NOT_RECRUITING
    COMPLETED
    NOT_APPLICABLE
    NOT_YET_RECRUITING
    RECRUITING
    SUSPENDED
    TERMINATED
    UNKNOWN_STATUS
    WITHDRAWN
    ENROLLING_BY_INVITATION
  }
  type EvDrug {
    id: String!
    name: String!
    type: DrugType!
    activity: DrugActivity!
  }
  type ClinicalTrial {
    phase: Int!
    status: ClinicalTrialStatus
    sourceUrl: String!
    sourceName: String!
  }
  type EvidenceMechanismOfAction {
    name: String!
    sourceUrl: String
    sourceName: String
  }
  type EvidenceRowDrugs {
    target: Target!
    disease: Disease!
    drug: EvDrug!
    clinicalTrial: ClinicalTrial!
    mechanismOfAction: EvidenceMechanismOfAction!
  }
`;
