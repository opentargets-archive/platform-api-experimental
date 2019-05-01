import { gql } from 'apollo-server-express';
import _ from 'lodash';

import { targetAssociations } from '../apis/openTargets';

export const typeDefs = [
  gql`
    enum DataType {
      GENETIC
      SOMATIC
      DRUG
      PATHWAY
      EXPRESSION
      TEXT_MINING
      ANIMAL_MODEL
    }
    type AssociationDataType {
      dataType: DataType!
      score: Float!
    }
    type TargetDiseasesEdge {
      node: Disease!
      score: Float!
      dataTypes: [AssociationDataType!]!
    }
    type TargetDiseasesConnection {
      edges: [TargetDiseasesEdge!]
    }
  `,
];

const DATA_TYPE_MAP = {
  genetic_association: 'GENETIC',
  somatic_mutation: 'SOMATIC',
  known_drug: 'DRUG',
  affected_pathway: 'PATHWAY',
  rna_expression: 'EXPRESSION',
  literature: 'TEXT_MINING',
  animal_model: 'ANIMAL_MODEL',
};

export const resolvers = _.merge(
  {},
  {
    TargetDiseasesConnection: {
      edges: ({ _ensgId }) =>
        targetAssociations(_ensgId).then(response => {
          const edges = response.data.data.map(d => {
            const therapeuticAreas = _.zip(
              d.disease.efo_info.therapeutic_area.codes,
              d.disease.efo_info.therapeutic_area.labels
            ).map(l => ({ id: l[0], name: l[1] }));
            const disease = {
              id: d.disease.id,
              name: d.disease.efo_info.label,
              therapeuticAreas:
                therapeuticAreas.length > 0 ? therapeuticAreas : [],
            };
            const score = 1.0 * d.association_score.overall;
            const dataTypes = Object.keys(d.association_score.datatypes).map(
              dt => {
                const dataType = DATA_TYPE_MAP[dt];
                return {
                  dataType,
                  score: 1.0 * d.association_score.datatypes[dt],
                };
              }
            );

            return {
              node: disease,
              score,
              dataTypes,
              // therapeuticAreas: therapeuticAreas.length > 0 ? therapeuticAreas : null,
            };
          });
          return edges;
        }),
    },
  }
);
