import { targetAssociations } from "../apis/openTargets";

const resolver = (obj, { ensgId }) => {
  return targetAssociations(ensgId).then(response => {
    const associations = response.data.data.map(d => {
      const disease = {
        id: d.disease.id,
        name: d.disease.efo_info.label,
      };
      const score = 1.0 * d.association_score.overall;
      const dataTypes = Object.keys(d.association_score.datatypes).map(dt => ({
        id: dt,
        name: dt.replace(/_/g, " "),
        score: 1.0 * d.association_score.datatypes[dt],
      }));
      return {
        disease,
        score,
        dataTypes,
      };
    });

    return {
      associations,
    };
  });
};

export default resolver;
