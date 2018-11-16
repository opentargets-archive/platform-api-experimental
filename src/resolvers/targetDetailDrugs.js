import _ from "lodash";
import { targetDrugsIterated } from "../apis/openTargets";

const targetDetailDrugs = async (obj, { ensgId }) => {
  const rows = await targetDrugsIterated(ensgId);
  return {
    rows: rows.map(d => {
      const efoId = d.disease.efo_info.efo_id.split("/").pop();
      const efoLabel = d.disease.efo_info.label;
      const drugId = d.drug.id.split("/").pop();
      const drugName = d.drug.molecule_name;
      const phase = d.evidence.drug2clinic.max_phase_for_disease.numeric_index;
      const status = d.evidence.drug2clinic.status;
      return {
        efoId,
        efoLabel,
        drugId,
        drugName,
        phase,
        status,
      };
    }),
  };
};

export default targetDetailDrugs;
