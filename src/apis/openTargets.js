import axios from "axios";

const PROTOCOL = "https";
const HOST = "api.opentargets.io";
const STEM = "v3/platform";
const ROOT = `${PROTOCOL}://${HOST}/${STEM}/`;

export const disease = efoId => axios.get(`${ROOT}private/disease/${efoId}`);
export const target = ensgId => axios.get(`${ROOT}private/target/${ensgId}`);
export const targetDrugs = ensgId =>
  axios.get(
    `${ROOT}public/evidence/filter?size=1000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&target=${ensgId}&expandefo=true`
  );
