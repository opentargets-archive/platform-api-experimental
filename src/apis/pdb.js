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
      return response.data[uniprotId][0].pdb_id;
    } else {
      return null;
    }
  });
