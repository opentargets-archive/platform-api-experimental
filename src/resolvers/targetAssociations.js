import _ from "lodash";
import { targetAssociations } from "../apis/openTargets";

const DATA_TYPE_MAP = {
  genetic_association: "GENETIC",
  somatic_mutation: "SOMATIC",
  known_drug: "DRUG",
  affected_pathway: "PATHWAY",
  rna_expression: "EXPRESSION",
  literature: "TEXT_MINING",
  animal_model: "ANIMAL_MODEL",
};

const resolver = (obj, { ensgId }) => {
  return targetAssociations(ensgId).then(response => {
    const associations = response.data.data.map(d => {
      const disease = {
        id: d.disease.id,
        name: d.disease.efo_info.label,
      };
      const score = 1.0 * d.association_score.overall;
      const dataTypes = Object.keys(d.association_score.datatypes).map(dt => {
        const dataType = DATA_TYPE_MAP[dt];
        return {
          dataType,
          score: 1.0 * d.association_score.datatypes[dt],
        };
      });
      const therapeuticAreas = _.zip(
        d.disease.efo_info.therapeutic_area.codes,
        d.disease.efo_info.therapeutic_area.labels
      ).map(l => ({ id: l[0], name: l[1] }));
      return {
        disease,
        score,
        dataTypes,
        therapeuticAreas: therapeuticAreas.length > 0 ? therapeuticAreas : null,
      };
    });

    return {
      associations,
    };
  });
};

export default resolver;
