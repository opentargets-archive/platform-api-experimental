import axios from 'axios';

const PROTOCOL = 'https';
const HOST = 'api.opentargets.io';
const STEM = 'v3/platform';
const ROOT = `${PROTOCOL}://${HOST}/${STEM}/`;

export const drug = chemblId => axios.get(`${ROOT}private/drug/${chemblId}`);
// TODO: REST API currently does not support POST for private/drug endpoint (needed for dataloader)
//       (this is currently making one call per drug, not scalable)
export const drugs = chemblIds =>
  Promise.all([
    Promise.resolve(chemblIds),
    Promise.all(chemblIds.map(chemblId => drug(chemblId))),
  ]);
export const disease = efoId => axios.get(`${ROOT}private/disease/${efoId}`);
export const diseases = efoIds =>
  Promise.all([
    Promise.resolve(efoIds),
    axios.post(`${ROOT}private/disease`, { diseases: efoIds }),
  ]);
export const target = ensgId => axios.get(`${ROOT}private/target/${ensgId}`);
export const targets = ensgIds =>
  Promise.all([
    Promise.resolve(ensgIds),
    axios.post(`${ROOT}private/target`, { id: ensgIds }),
  ]);

export const expressions = ensgIds =>
  axios.post(`${ROOT}private/target/expression`, { gene: ensgIds });

const targetsDrugsIteration = async (ensgIds, next = null) => {
  const props = {
    size: 10000,
    datasource: ['chembl'],
    fields: ['disease.efo_info', 'drug', 'evidence', 'target', 'access_level'],
    expandefo: true,
    target: ensgIds,
  };
  return next
    ? axios.post(`${ROOT}public/evidence/filter`, { ...props, next })
    : axios.post(`${ROOT}public/evidence/filter`, props);
};
async function targetsDrugsIterated(ensgIds) {
  const first = targetsDrugsIteration(ensgIds);
  let prev = await first;
  let rows = [];
  while (true) {
    const next = prev ? prev.data.next : null;
    rows = [...rows, ...prev.data.data];
    if (next) {
      prev = await targetsDrugsIteration(ensgIds, next);
    } else {
      break;
    }
  }
  return rows;
}
export const targetsDrugs = ensgIds =>
  Promise.all([Promise.resolve(ensgIds), targetsDrugsIterated(ensgIds)]);

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

export const targetVariantsRare = ensgId =>
  axios.get(
    `${ROOT}public/evidence/filter?size=10000&datasource=eva&datasource=uniprot&target=${ensgId}&fields=target.gene_info&fields=disease.efo_info&fields=variant&fields=evidence&fields=type`
  );
export const targetVariantsCommon = ensgId =>
  axios.get(
    `${ROOT}public/evidence/filter?size=10000&datasource=gwas_catalog&datasource=phewas_catalog&target=${ensgId}&fields=target.gene_info&fields=disease.efo_info&fields=variant&fields=evidence&fields=type`
  );

export const targetSimilar = ensgId =>
  axios.get(`${ROOT}private/relation/target/${ensgId}?id=${ensgId}&size=10000`);
export const targetAssociations = ensgId =>
  axios.post(`${ROOT}public/association/filter`, {
    target: [ensgId],
    facets: false,
    direct: true,
    size: 10000,
    sort: ['association_score.overall'],
    search: '',
    draw: 2,
  });
export const targetAssociationsFacets = ensgId =>
  axios.get(
    `${ROOT}public/association/filter?target=${ensgId}&outputstructure=flat&facets=true&direct=true&size=1`
  );

export const diseaseSimilar = efoId =>
  axios.get(`${ROOT}private/relation/disease/${efoId}?id=${efoId}&size=10000`);

const diseasesDrugsIteration = async (efoIds, next = null) => {
  const props = {
    size: 10000,
    datasource: ['chembl'],
    fields: ['disease.efo_info', 'drug', 'evidence', 'target', 'access_level'],
    expandefo: true,
    disease: efoIds,
  };
  return next
    ? axios.post(`${ROOT}public/evidence/filter`, { ...props, next })
    : axios.post(`${ROOT}public/evidence/filter`, props);
};
async function diseasesDrugsIterated(efoIds) {
  const first = diseasesDrugsIteration(efoIds);
  let prev = await first;
  let rows = [];
  while (true) {
    const next = prev ? prev.data.next : null;
    rows = [...rows, ...prev.data.data];
    if (next) {
      prev = await diseasesDrugsIteration(efoIds, next);
    } else {
      break;
    }
  }
  return rows;
}

export async function diseaseDrugsIterated(efoId) {
  const first = axios.get(
    `${ROOT}public/evidence/filter?size=10000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&disease=${efoId}&expandefo=true`
  );
  let prev = await first;
  let rows = [];
  while (true) {
    const next = prev ? prev.data.next : null;
    rows = [...rows, ...prev.data.data];
    if (next) {
      prev = await axios.get(
        `${ROOT}public/evidence/filter?size=10000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&disease=${efoId}&expandefo=true&next=${
          next[0]
        }&next=${next[1]}`
      );
    } else {
      break;
    }
  }
  return rows;
}
export const diseasesDrugs = efoIds =>
  Promise.all([
    Promise.resolve(efoIds),
    Promise.all(efoIds.map(efoId => diseaseDrugsIterated(efoId))),
  ]);
