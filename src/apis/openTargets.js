import axios from "axios";

const PROTOCOL = "https";
const HOST = "api.opentargets.io";
const STEM = "v3/platform";
const ROOT = `${PROTOCOL}://${HOST}/${STEM}/`;

export const disease = efoId => axios.get(`${ROOT}private/disease/${efoId}`);
export const target = ensgId => axios.get(`${ROOT}private/target/${ensgId}`);
