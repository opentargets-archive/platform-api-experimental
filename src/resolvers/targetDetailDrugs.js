import _ from "lodash";
import { targetDrugsIterated } from "../apis/openTargets";

const MAP_ACTIVITY = {
  drug_positive_modulator: "agonist",
  drug_negative_modulator: "antagonist",
};

const targetDetailDrugs = async (obj, { ensgId }) => {
  const rows = await targetDrugsIterated(ensgId);
  return {
    rows: rows.map(d => {
      const targetId = d.target.id;
      const targetSymbol = d.target.gene_info.symbol;
      const targetClass = d.target.target_class[0];
      const efoId = d.disease.efo_info.efo_id.split("/").pop();
      const efoLabel = d.disease.efo_info.label;
      const drugId = d.drug.id.split("/").pop();
      const drugName = d.drug.molecule_name;
      const drugType = d.drug.molecule_type;
      const phase = d.evidence.drug2clinic.max_phase_for_disease.numeric_index;
      const status = d.evidence.drug2clinic.status;
      const activity = MAP_ACTIVITY[d.target.activity];

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
      };
    }),
  };
};

export default targetDetailDrugs;
