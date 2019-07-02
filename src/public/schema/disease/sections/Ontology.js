import { gql } from 'apollo-server-express';

import efo from '../../../data/efo/efo2.1904.json';
import therapeuticAreaIds from '../../../data/efo/efo2.1904.json';

export const id = 'ontology';

export const summaryTypeDefs = gql`
  type DiseaseSummaryOntology {
    isTherapeuticArea: Boolean!
    isLeaf: Boolean!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  DiseaseSummaryOntology: {
    isTherapeuticArea: ({ _efoId }) => therapeuticAreaIds.indexOf(_efoId) >= 0,
    isLeaf: ({ _efoId }) => false,
    sources: () => [
      {
        name: 'EFO',
        url: 'https://www.ebi.ac.uk/efo/',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  type DiseaseOntologyNode {
    id: String!
    name: String!
    parentIds: [String!]!
  }
  type DiseaseDetailOntology {
    nodes: [DiseaseOntologyNode!]!
  }
`;

export const sectionResolvers = {
  DiseaseDetailOntology: {
    nodes: ({ _efoId }) => efo,
  },
};
