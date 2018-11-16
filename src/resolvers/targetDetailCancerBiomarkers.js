import _ from "lodash";
import { target } from "../apis/openTargets";
import getMultiplePublicationsSource from "../utils/getMultiplePublicationsSource";

const targetDetailCancerBiomarkers = async (obj, { ensgId }) => {
  const response = await target(ensgId);
  const { data } = response;

  if (!data.cancerbiomarkers) {
    return null;
  }

  const { cancerbiomarkers: rows } = data;
  const rowsFormatted = rows.map(d => {
    const publicationSource = getMultiplePublicationsSource(
      d.references.pubmed.map(d2 => d2.pmid) || []
    );
    const otherSources = (d.references.other || []).map(d2 => ({
      url: d2.link,
      label: d2.name,
    }));
    const sources = [
      ...(publicationSource ? [publicationSource] : []),
      ...otherSources,
    ];
    const associationType = d.association.replace(" ", "_").toUpperCase();
    return {
      biomarker: d.individualbiomarker || d.biomarker, // TODO: refactor upstream
      diseases: d.diseases.map(d2 => ({ efoId: d2.id, efoLabel: d2.label })),
      evidenceLevel: d.evidencelevel,
      drugName: d.drugfullname,
      associationType,
      sources,
    };
  });

  return {
    rows: rowsFormatted,
  };
};

export default targetDetailCancerBiomarkers;
