import { disease } from "../apis/openTargets";

const diseaseSummary = (obj, { efoId }) => {
  return disease(efoId).then(response => {
    const { label: name, efo_synonyms: synonyms } = response.data;
    return { id: efoId, name, synonyms };
  });
};

export default diseaseSummary;
