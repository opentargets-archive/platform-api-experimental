import axios from "axios";

const PROTOCOL = "https";
const HOST = "www.ebi.ac.uk";
const STEM = "pdbe/api";
const ROOT = `${PROTOCOL}://${HOST}/${STEM}/`;

export const bestStructure = uniprotId =>
  axios.get(`${ROOT}/mappings/best_structures/${uniprotId}`).then(response => {
    if (
      response.data &&
      response.data[uniprotId] &&
      response.data[uniprotId].length > 0
    ) {
      // these are ranked by coverage, so take the first as best
      const pdbId = response.data[uniprotId][0].pdb_id;

      // give all results back
      const pdbEntries = response.data[uniprotId].map(d => ({
        id: d.pdb_id,
        chain: d.chain_id,
        start: d.unp_start,
        end: d.unp_end,
        coverage: d.coverage,
        resolution: d.resolution,
        method: d.experimental_method,
      }));
      return { pdbId, pdbEntries };
    } else {
      return { pdbId: null, pdbEntries: [] };
    }
  });
