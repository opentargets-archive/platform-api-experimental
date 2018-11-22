import _ from "lodash";
import { target } from "../apis/openTargets";

const targetDetailChemicalProbes = async (obj, { ensgId }) => {
  const response = await target(ensgId);
  const { data } = response;

  if (!data.chemicalprobes || !data.chemicalprobes.portalprobes || data.chemicalprobes.portalprobes.length===0) {
    return null;
  }

  const rows = data.chemicalprobes.portalprobes;

  const rowsFormatted = rows.map(d => {
    return {
      chemicalprobe: d.chemicalprobe,
      note: d.note !== "none" ? d.note : "",
      sources: d.sourcelinks.map(sl => ({
        url: sl.link.toLowerCase().substring(0, 4) === 'http' ? sl.link : 'http://'+sl.link, 
        label: sl.source
      })),
    }
  });

  return {
    rows: rowsFormatted,
  };
};

export default targetDetailChemicalProbes;
