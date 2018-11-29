import axios from "axios";

const PROTOCOL = "https";
const HOST = "api.opentargets.io";
const STEM = "v3/platform";
const ROOT = `${PROTOCOL}://${HOST}/${STEM}/`;

export const disease = efoId => axios.get(`${ROOT}private/disease/${efoId}`);
export const target = ensgId => axios.get(`${ROOT}private/target/${ensgId}`);
export const targets = ensgIds =>
  Promise.all([
    Promise.resolve(ensgIds),
    axios.post(`${ROOT}private/target`, { id: ensgIds }),
  ]);
export const targetDrugs = (ensgId, next = null) =>
  next
    ? axios.get(
        `${ROOT}public/evidence/filter?size=1000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&target=${ensgId}&expandefo=true&next=${
          next[0]
        }&next=${next[1]}`
      )
    : axios.get(
        `${ROOT}public/evidence/filter?size=1000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&target=${ensgId}&expandefo=true`
      );
export async function targetDrugsIterated(ensgId) {
  const first = axios.get(
    `${ROOT}public/evidence/filter?size=1000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&target=${ensgId}&expandefo=true`
  );
  let prev = await first;
  let rows = [];
  while (true) {
    const next = prev ? prev.data.next : null;
    rows = [...rows, ...prev.data.data];
    if (next) {
      prev = await axios.get(
        `${ROOT}public/evidence/filter?size=1000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&target=${ensgId}&expandefo=true&next=${
          next[0]
        }&next=${next[1]}`
      );
    } else {
      break;
    }
  }
  return rows;
}

export const targetSimilar = ensgId =>
  axios.get(`${ROOT}private/relation/target/${ensgId}?id=${ensgId}&size=10000`);
export const targetAssociations = ensgId =>
  axios.post(`${ROOT}public/association/filter`, {
    target: [ensgId],
    facets: false,
    direct: true,
    size: 10000,
    sort: ["association_score.overall"],
    search: "",
    draw: 2,
  });
export const targetAssociationsFacets = ensgId =>
  axios.get(
    `${ROOT}public/association/filter?target=${ensgId}&outputstructure=flat&facets=true&direct=true&size=1`
  );
