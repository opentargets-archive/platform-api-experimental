import axios from "axios";
import _ from "lodash";

const PROTOCOL = "https";
const HOST = "www.ebi.ac.uk";
const STEM = "proteins/api";
const ROOT = `${PROTOCOL}://${HOST}/${STEM}/`;

export const secondaryStructure = uniprotId =>
  axios.get(`${ROOT}proteins/${uniprotId}`).then(response => {
    if (response.data) {
      const { features, sequence } = response.data;
      const { mass, length } = sequence;
      const featuresStructural = features
        .filter(d => d.category === "STRUCTURAL")
        .map(d => ({
          type: d.type,
          start: parseInt(d.begin),
          end: parseInt(d.end),
        }));

      return { mass, length, features: featuresStructural };
    } else {
      return { mass: null, length: null, features: [] };
    }
  });
