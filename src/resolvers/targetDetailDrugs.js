import _ from "lodash";
import { targetDrugsIterated } from "../apis/openTargets";

const MAP_ACTIVITY = {
  drug_positive_modulator: "agonist",
  drug_negative_modulator: "antagonist",
  up_or_down: "up_or_down",
};

const targetDetailDrugs = async (obj, { ensgId }) => {
  const rows = await targetDrugsIterated(ensgId);
  const rowsFormatted = rows.map(d => {
    const targetId = d.target.id;
    const targetSymbol = d.target.gene_info.symbol;
    const targetClass = d.target.target_class[0];
    const efoId = d.disease.efo_info.efo_id.split("/").pop();
    const efoLabel = d.disease.efo_info.label;
    const drugId = d.drug.id.split("/").pop();
    const drugName = d.drug.molecule_name;
    const drugType = d.drug.molecule_type.replace(" ", "_").toUpperCase();
    const mechanismOfAction = d.evidence.target2drug.mechanism_of_action;
    const mechanismOfActionUrl =
      d.evidence.target2drug.urls.length === 3
        ? d.evidence.target2drug.urls[2].url
        : null;
    const mechanismOfActionSource =
      d.evidence.target2drug.urls.length === 3
        ? d.evidence.target2drug.urls[2].nice_name
        : null;
    const phase = d.evidence.drug2clinic.max_phase_for_disease.numeric_index;
    const status = d.evidence.drug2clinic.status
      ? d.evidence.drug2clinic.status
          .replace(" ", "_")
          .replace(",", "")
          .toUpperCase()
      : null;
    const activity = MAP_ACTIVITY[d.target.activity].toUpperCase();
    const evidenceUrl = d.evidence.drug2clinic.urls[0].url;
    const evidenceSource = d.evidence.drug2clinic.urls[0].nice_name.replace(
      " Information",
      ""
    );
    return {
      targetId,
      targetSymbol,
      targetClass,
      efoId,
      efoLabel,
      drugId,
      drugName,
      drugType,
      phase,
      status,
      activity,
      evidenceUrl,
      evidenceSource,
      mechanismOfAction,
      mechanismOfActionUrl,
      mechanismOfActionSource,
    };
  });
  return {
    rows: rowsFormatted,
  };
};

export default targetDetailDrugs;
