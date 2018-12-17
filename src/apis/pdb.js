import axios from "axios";
import _ from "lodash";

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
        pdbId: d.pdb_id,
        chain: d.chain_id,
        start: d.unp_start,
        end: d.unp_end,
        coverage: d.coverage,
        resolution: d.resolution,
        method: d.experimental_method,
      }));

      // collapsing across chains
      const pdbEntriesCollapsed = Object.values(
        pdbEntries.reduce((acc, d) => {
          if (!acc[d.pdbId]) {
            acc[d.pdbId] = { ...d, chain: [] };
          }
          acc[d.pdbId].chain.push(d.chain);
          return acc;
        }, {})
      ).reduce((acc, d) => {
        acc.push({ ...d, chain: d.chain.join("/") });
        return acc;
      }, []);

      return { pdbId, pdbEntries: pdbEntriesCollapsed };
    } else {
      return { pdbId: null, pdbEntries: [] };
    }
  });
