import { gql } from 'apollo-server-express';

import efo from '../../../data/efo/efo3.1911.json';
import therapeuticAreaIds from '../../../data/efo/efo3.therapeuticAreas.json';

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
    isLeaf: ({ _efoId }) => !efo.find(d => d.parentIds.indexOf(_efoId) >= 0),
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
    therapeuticAreas: [String!]!
  }
`;

export const sectionResolvers = {
  DiseaseDetailOntology: {
    nodes: () => efo,
    therapeuticAreas: () => therapeuticAreaIds,
  },
};
