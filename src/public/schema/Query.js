import { gql } from 'apollo-server-express';
import _ from 'lodash';

import efo from '../data/efo/efo3.1911.json';
import therapeuticAreaIds from '../data/efo/efo3.therapeuticAreas.json';

export const typeDefs = [
  gql`
    type DiseaseOntology {
      nodes: [DiseaseOntologyNode!]!
      therapeuticAreas: [String!]!
    }
    type Query {
      target(ensgId: String!): Target!
      disease(efoId: String!): Disease!
      drug(chemblId: String!): Drug!
      efo: DiseaseOntology!
      evidence(
        ensgId: String!
        efoId: String!
        from: Int
        size: Int
        sortBy: String
        order: String
      ): Evidence!
    }
  `,
];

export const resolvers = {
  DiseaseOntology: {
    nodes: () => efo,
    therapeuticAreas: () => therapeuticAreaIds,
  },
  Query: {
    target: (obj, { ensgId }) => ({ _ensgId: ensgId }),
    disease: (obj, { efoId }) => ({ _efoId: efoId }),
    drug: (obj, { chemblId }) => ({ _chemblId: chemblId }),
    efo: () => ({}),
    evidence: (obj, { ensgId, efoId, from, size, sortBy, order }) => ({
      _ensgId: ensgId,
      _efoId: efoId,
      _from: from,
      _size: size,
      _sortBy: sortBy,
      _order: order,
    }),
  },
};
