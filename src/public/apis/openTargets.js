import axios from 'axios';
import _ from 'lodash';
import queryString from 'query-string';

import { getAbstractData } from './epmc';
import getMultiplePublicationsSource from '../utils/getMultiplePublicationsSource';

const PROTOCOL = 'https';
const HOST = 'platform-api-qc.opentargets.io';
const STEM = 'v3/platform';
const ROOT = `${PROTOCOL}://${HOST}/${STEM}/`;

// encode/decode elasticsearch search_after to string
// search_after gives `next` as multi-typed array
const nextToCursor = next =>
  next ? Buffer.from(JSON.stringify(next)).toString('base64') : null; // not present if on last page
const cursorToNext = cursor =>
  JSON.parse(Buffer.from(cursor, 'base64').toString());

export const drug = chemblId => axios.get(`${ROOT}private/drug/${chemblId}`);
// TODO: REST API currently does not support POST for private/drug endpoint (needed for dataloader)
//       (this is currently making one call per drug, not scalable)
export const drugs = chemblIds =>
  Promise.all([
    Promise.resolve(chemblIds),
    Promise.all(chemblIds.map(chemblId => drug(chemblId))),
  ]);
export const drugDiseases = drugName =>
  axios
    .get(
      `${ROOT}public/search?q=${drugName}&size=1000&filter=disease&search_profile=drug`
    )
    .then(response =>
      response.data.data.map(d => ({
        id: d.data.id,
        name: d.data.name,
        description: d.data.description,
      }))
    );

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

const transformTargetAssociationsFacetsInput = facets => {
  const facetFields = {};
  if (facets) {
    if (facets.therapeuticArea) {
      facetFields.therapeutic_area = facets.therapeuticArea.efoIds;
    }
    if (facets.dataTypeAndSource) {
      facetFields.datatype =
        facets.dataTypeAndSource.dataTypeIds &&
        facets.dataTypeAndSource.dataTypeIds.map(dt => dataTypeMapInverse[dt]);
      facetFields.datasource =
        facets.dataTypeAndSource.dataSourceIds &&
        facets.dataTypeAndSource.dataSourceIds.map(ds => ds.toLowerCase());
    }
  }
  return facetFields;
};
const transformDiseaseAssociationsFacetsInput = facets => {
  const facetFields = {};
  if (facets) {
    if (facets.pathways) {
      facetFields.pathway = facets.pathways.pathwayIds;
    }
    if (facets.targetClass) {
      facetFields.target_class = facets.targetClass.targetClassIds;
    }
    if (facets.tractability && facets.tractability.tractabilityIds) {
      facetFields.tractability = facets.tractability.tractabilityIds.map(d =>
        d.toLowerCase()
      );
    }
    if (facets.tissueSpecificity && facets.tissueSpecificity.tissueIds) {
      facetFields.zscore_expression_level = 1;
      facetFields.zscore_expression_tissue = facets.tissueSpecificity.tissueIds;
    }
    if (facets.dataTypeAndSource) {
      facetFields.datatype =
        facets.dataTypeAndSource.dataTypeIds &&
        facets.dataTypeAndSource.dataTypeIds.map(dt => dataTypeMapInverse[dt]);
      facetFields.datasource =
        facets.dataTypeAndSource.dataSourceIds &&
        facets.dataTypeAndSource.dataSourceIds.map(ds => ds.toLowerCase());
    }
  }
  return facetFields;
};
export const targetAssociations = (
  ensgId,
  facets,
  search,
  sortField,
  sortAscending,
  first,
  after
) => {
  // handle each facet
  const facetFields = transformTargetAssociationsFacetsInput(facets);

  // sort
  let sortFieldMapped;
  if (sortField === 'DISEASE_NAME') {
    sortFieldMapped = 'disease.efo_info.label';
  } else if (sortField === 'SCORE_OVERALL' || !sortField) {
    sortFieldMapped = 'association_score.overall';
  } else {
    // nothing else currently supported
    const dataType = sortField;
    sortFieldMapped = `association_score.datatypes.${
      dataTypeMapInverse[dataType]
    }`;
  }
  const sort = [`${sortAscending ? '~' : ''}${sortFieldMapped}`];

  // next field
  const nextField = {};
  if (after) {
    nextField.next = cursorToNext(after);
  }

  // call
  return axios
    .post(`${ROOT}public/association/filter`, {
      target: [ensgId],
      ...nextField,
      ...facetFields,
      facets: false,
      direct: true,
      size: first,
      sort,
      search,
    })
    .then(response => {
      const totalCount = response.data.total;
      const edges = response.data.data.map(d => ({
        id: `${ensgId}-${d.disease.id}`,
        node: {
          id: d.disease.id,
          name: d.disease.efo_info.label,
        },
        score: d.association_score.overall,
        scoresByDataType: Object.entries(d.association_score.datatypes).reduce(
          (acc, [k, v]) => {
            acc.push({ dataTypeId: dataTypeMap[k], score: v });
            return acc;
          },
          []
        ),
        scoresByDataSource: Object.entries(
          d.association_score.datasources
        ).reduce((acc, [k, v]) => {
          // TODO: fix in rest api
          if (k !== 'postgap') {
            acc.push({ dataSourceId: k.toUpperCase(), score: v });
          }
          return acc;
        }, []),
      }));
      const cursor = nextToCursor(response.data.next);
      return { totalCount, edges, cursor };
    });
};
export const diseaseAssociations = (
  efoId,
  facets,
  search,
  sortField,
  sortAscending,
  first,
  after
) => {
  // handle each facet
  const facetFields = transformDiseaseAssociationsFacetsInput(facets);

  // sort
  let sortFieldMapped;
  if (sortField === 'TARGET_SYMBOL') {
    sortFieldMapped = 'target.gene_info.symbol';
  } else if (sortField === 'SCORE_OVERALL' || !sortField) {
    sortFieldMapped = 'association_score.overall';
  } else {
    // nothing else currently supported
    const dataType = sortField;
    sortFieldMapped = `association_score.datatypes.${
      dataTypeMapInverse[dataType]
    }`;
  }
  const sort = [`${sortAscending ? '~' : ''}${sortFieldMapped}`];

  // next field
  const nextField = {};
  if (after) {
    nextField.next = cursorToNext(after);
  }

  // call
  return axios
    .post(`${ROOT}public/association/filter`, {
      disease: [efoId],
      ...nextField,
      ...facetFields,
      facets: false,
      direct: true,
      size: first,
      sort,
      search,
    })
    .then(response => {
      const totalCount = response.data.total;
      const edges = response.data.data.map(d => ({
        id: `${d.target.id}-${efoId}`,
        node: {
          id: d.target.id,
          symbol: d.target.gene_info.symbol,
          name: d.target.gene_info.name,
        },
        score: d.association_score.overall,
        scoresByDataType: Object.entries(d.association_score.datatypes).reduce(
          (acc, [k, v]) => {
            acc.push({ dataTypeId: dataTypeMap[k], score: v });
            return acc;
          },
          []
        ),
        scoresByDataSource: Object.entries(
          d.association_score.datasources
        ).reduce((acc, [k, v]) => {
          // TODO: fix in rest api
          if (k !== 'postgap') {
            acc.push({ dataSourceId: k.toUpperCase(), score: v });
          }
          return acc;
        }, []),
      }));
      const cursor = nextToCursor(response.data.next);
      return { totalCount, edges, cursor };
    });
};

const dataTypeMap = {
  genetic_association: 'GENETIC_ASSOCIATION',
  somatic_mutation: 'SOMATIC_MUTATION',
  known_drug: 'KNOWN_DRUGS',
  affected_pathway: 'PATHWAYS',
  rna_expression: 'DIFFERENTIAL_EXPRESSION',
  animal_model: 'ANIMAL_MODELS',
  literature: 'TEXT_MINING',
};
const dataTypeOrder = [
  'GENETIC_ASSOCIATION',
  'SOMATIC_MUTATION',
  'KNOWN_DRUGS',
  'PATHWAYS',
  'DIFFERENTIAL_EXPRESSION',
  'TEXT_MINING',
  'ANIMAL_MODELS',
];
const dataTypeMapInverse = Object.entries(dataTypeMap).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {});
export const targetAssociationsFacets = (ensgId, facets) => {
  // handle each facet
  const facetFields = transformTargetAssociationsFacetsInput(facets);

  // serialise
  const qs = queryString.stringify({
    target: [ensgId],
    ...facetFields,
    outputstructure: 'flat',
    facets: true,
    direct: true,
    size: 0,
  });

  // call
  return axios.get(`${ROOT}public/association/filter?${qs}`).then(response => {
    const facetsRaw = response.data.facets;
    const therapeuticArea = {
      items: facetsRaw.therapeutic_area.buckets.map(b => ({
        itemId: b.key,
        name: _.startCase(b.label),
        count: b.unique_disease_count.value,
      })),
    };
    const dataTypeAndSource = {
      items: dataTypeOrder.map(d => {
        const dt = facetsRaw.datatype.buckets.find(
          dt => dataTypeMap[dt.key] === d
        );
        return dt
          ? {
              itemId: dataTypeMap[dt.key],
              name: _.startCase(dt.key),
              count: dt.unique_disease_count.value,
              children: dt.datasource.buckets.map(ds => ({
                itemId: ds.key.toUpperCase(),
                name: _.startCase(ds.key),
                count: ds.unique_disease_count.value,
              })),
            }
          : {
              itemId: d,
              name: _.startCase(d.toLowerCase()),
              count: 0,
              children: [],
            };
      }),
    };
    return { therapeuticArea, dataTypeAndSource };
  });
};
export const diseaseAssociationsFacets = (efoId, facets) => {
  // handle each facet
  const facetFields = transformDiseaseAssociationsFacetsInput(facets);

  // serialise
  const qs = queryString.stringify({
    disease: [efoId],
    ...facetFields,
    outputstructure: 'flat',
    facets: true,
    // direct: false, // absent in original call
    size: 0,
  });

  // call
  return axios.get(`${ROOT}public/association/filter?${qs}`).then(response => {
    const facetsRaw = response.data.facets;
    const dataTypeAndSource = {
      items: dataTypeOrder.map(d => {
        const dt = facetsRaw.datatype.buckets.find(
          dt => dataTypeMap[dt.key] === d
        );
        return dt
          ? {
              itemId: dataTypeMap[dt.key],
              name: _.startCase(dt.key),
              count: dt.unique_target_count.value,
              children: dt.datasource.buckets.map(ds => ({
                itemId: ds.key.toUpperCase(),
                name: _.startCase(ds.key),
                count: ds.unique_target_count.value,
              })),
            }
          : {
              itemId: d,
              name: _.startCase(d.toLowerCase()),
              count: 0,
              children: [],
            };
      }),
    };
    const pathways = {
      items: facetsRaw.pathway.buckets.map(d => ({
        itemId: d.key,
        name: d.label,
        count: d.unique_target_count.value,
        children: d.pathway.buckets.map(d2 => ({
          itemId: d2.key,
          name: d2.label,
          count: d2.unique_target_count.value,
        })),
      })),
    };
    const targetClass = {
      items: facetsRaw.target_class.buckets.map(d => ({
        itemId: `${d.key}`, // returns an int
        name: d.label,
        count: d.unique_target_count.value,
        children: d.target_class.buckets.map(d2 => ({
          itemId: `${d2.key}`,
          name: d2.label,
          count: d2.unique_target_count.value,
        })),
      })),
    };
    const tractability = {
      items: facetsRaw.tractability.buckets.map(d => ({
        itemId: d.key.toUpperCase(),
        name: _.startCase(
          d.key.replace('smallmolecule_', '').replace('antibody_', '')
        ),
        count: d.unique_target_count.value,
      })),
    };
    const tissueSpecificity = {
      items: facetsRaw.zscore_expression_tissue.buckets.map(d => ({
        itemId: d.data.efo_code,
        name: d.data.label,
        organs: d.data.organs,
        anatomicalSystems: d.data.anatomical_systems,
      })),
    };
    return {
      dataTypeAndSource,
      pathways,
      targetClass,
      tractability,
      tissueSpecificity,
    };
  });
};

export const targetDiseasesConnection = (
  ensgId,
  facets,
  search,
  sortField,
  sortAscending,
  first,
  after
) =>
  Promise.all([
    targetAssociations(
      ensgId,
      facets,
      search,
      sortField,
      sortAscending,
      first,
      after
    ),
    targetAssociationsFacets(ensgId, facets),
  ]).then(
    ([
      { totalCount, edges, cursor },
      { therapeuticArea, dataTypeAndSource },
    ]) => {
      return {
        totalCount,
        edges,
        pageInfo: { nextCursor: cursor, hasNextPage: cursor !== null },
        facets: { therapeuticArea, dataTypeAndSource },
      };
    }
  );
export const diseaseTargetsConnection = (
  efoId,
  facets,
  search,
  sortField,
  sortAscending,
  first,
  after
) =>
  Promise.all([
    diseaseAssociations(
      efoId,
      facets,
      search,
      sortField,
      sortAscending,
      first,
      after
    ),
    diseaseAssociationsFacets(efoId, facets),
  ]).then(
    ([
      { totalCount, edges, cursor },
      {
        dataTypeAndSource,
        pathways,
        targetClass,
        tractability,
        tissueSpecificity,
      },
    ]) => {
      return {
        totalCount,
        edges,
        pageInfo: { nextCursor: cursor, hasNextPage: cursor !== null },
        facets: {
          dataTypeAndSource,
          pathways,
          targetClass,
          tractability,
          tissueSpecificity,
        },
      };
    }
  );

export const targetsAssociationsFacets = ensgIds =>
  Promise.all([
    Promise.resolve(ensgIds),
    Promise.all(ensgIds.map(ensgId => targetAssociationsFacets(ensgId))),
  ]);

export const diseaseSimilar = efoId =>
  axios.get(`${ROOT}private/relation/disease/${efoId}?id=${efoId}&size=10000`);
export const associations = ({ ensgIds, efoIds }) =>
  axios.post(
    `https://platform-api.opentargets.io/v3/platform/public/association/filter`,
    {
      disease: efoIds,
      target: ensgIds,
      size: 10000,
    }
  );
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

// export const evidenceDrugsCount = (ensgId, efoId) =>
//   axios
//     .get(
//       `${ROOT}public/evidence/filter?size=0&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&target=${ensgId}&disease=${efoId}&expandefo=true`
//     )
//     .then(response => {
//       console.log(response.data);
//       const
//       return response.data.total;
//     });

export const evidenceDrugsRowTransformer = r => {
  return {
    target: {
      id: r.target.id,
      symbol: r.target.gene_info.symbol,
      class: r.target.target_class[0],
    },
    disease: {
      id: r.disease.efo_info.efo_id.split('/').pop(),
      name: r.disease.efo_info.label,
    },
    drug: {
      id: r.drug.id.split('/').pop(),
      name: r.drug.molecule_name,
      type: r.drug.molecule_type.replace(' ', '_').toUpperCase(),
      activity: r.target.activity.toUpperCase(),
    },
    clinicalTrial: {
      phase: r.evidence.drug2clinic.clinical_trial_phase.numeric_index,
      status: r.evidence.drug2clinic.status
        ? r.evidence.drug2clinic.status
            .replace(/\s+/g, '_')
            .replace(',', '')
            .toUpperCase()
        : null,
      sourceName: r.evidence.drug2clinic.urls[0].nice_name.replace(
        ' Information',
        ''
      ),
      sourceUrl: r.evidence.drug2clinic.urls[0].url,
    },
    mechanismOfAction: {
      name: r.evidence.target2drug.mechanism_of_action,
      sourceName:
        r.evidence.target2drug.urls.length === 3
          ? r.evidence.target2drug.urls[2].nice_name
          : null,
      sourceUrl:
        r.evidence.target2drug.urls.length === 3
          ? r.evidence.target2drug.urls[2].url
          : null,
    },
  };
};
export async function evidenceDrugsIterated(ensgId, efoId) {
  const first = axios.get(
    `${ROOT}public/evidence/filter?size=10000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&target=${ensgId}&disease=${efoId}&expandefo=true`
  );
  let prev = await first;
  let rows = [];
  while (true) {
    const next = prev ? prev.data.next : null;
    rows = [...rows, ...prev.data.data];
    if (next) {
      prev = await axios.get(
        `${ROOT}public/evidence/filter?size=10000&datasource=chembl&fields=disease.efo_info&fields=drug&fields=evidence&fields=target&fields=access_level&target=${ensgId}&disease=${efoId}&expandefo=true&next=${
          next[0]
        }&next=${next[1]}`
      );
    } else {
      break;
    }
  }
  return rows;
}
export const evidenceDrugs = (ensgId, efoId) =>
  evidenceDrugsIterated(ensgId, efoId).then(rowsRaw => {
    const rows = rowsRaw.map(evidenceDrugsRowTransformer);
    const drugCount = _.uniqBy(rowsRaw, 'drug.molecule_name').length;
    return { rows, drugCount };
  });

// export const evidenceSomatic = (ensgId, efoId) =>
// axios.get(
//   `${ROOT}public/evidence/filter?size=1000&datasource=cancer_gene_census&datasource=uniprot_somatic&datasource=eva_somatic&datasource=intogen&fields=disease.efo_info&fields=evidence.evidence_codes_info&fields=evidence.urls&fields=evidence.known_mutations&fields=evidence.provenance_type&fields=evidence.known_mutations&fields=access_level&fields=unique_association_fields.mutation_type&fields=target.activity&fields=sourceID&target=${ensgId}&disease=${efoId}&expandefo=true`
// ).then(response => {
//   const rows = response.data.map(r => )
// })
// https://platform-api.opentargets.io/v3/platform/public/evidence/filter?size=1000&datasource=cancer_gene_census&datasource=uniprot_somatic&datasource=eva_somatic&datasource=intogen&fields=disease.efo_info&fields=evidence.evidence_codes_info&fields=evidence.urls&fields=evidence.known_mutations&fields=evidence.provenance_type&fields=evidence.known_mutations&fields=access_level&fields=unique_association_fields.mutation_type&fields=target.activity&fields=sourceID&target=ENSG00000121879&disease=EFO_0000305&expandefo=true

const MAP_PATHWAYS_SOURCE = {
  reactome: 'Reactome',
  slapenrich: 'SLAPenrich',
  progeny: 'PROGENy',
};
const MAP_PATHWAYS_REACTOME_ACTIVITY = {
  decreased_transcript_level: 'DECREASED_TRANSCRIPT_LEVEL',
  gain_of_function: 'GAIN_OF_FUNCTION',
  loss_of_function: 'LOSS_OF_FUNCTION',
  partial_loss_of_function: 'PARTIAL_LOSS_OF_FUNCTION',
  up_or_down: 'UP_OR_DOWN',
};
const evidencePathwaysRowTransformer = r => {
  return {
    disease: {
      id: r.disease.efo_info.efo_id.split('/').pop(),
      name: r.disease.efo_info.label,
    },
    activity: r.target.activity
      ? MAP_PATHWAYS_REACTOME_ACTIVITY[r.target.activity]
      : null, // only for reactome
    pathway: {
      id: r.evidence.urls[0].url.split('/#').pop(),
      name: r.evidence.urls[0].nice_name,
    },
    source: {
      name: MAP_PATHWAYS_SOURCE[r.sourceID],
      url: r.evidence.provenance_type.literature.references[0].lit_id,
    },
    mutations:
      r.evidence.known_mutations && r.evidence.known_mutations.length > 0
        ? r.evidence.known_mutations.map(m => m.preferred_name)
        : [],
  };
};
const evidenceCrisprRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  score: r.scores.association_score,
  method: r.evidence.resource_score.method.description,
  pmId: '30971826', // TODO: this should be returned in the API
});
const evidenceSysBioRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  geneSet: r.unique_association_fields.gene_set,
  method: r.evidence.resource_score.method.description,
  pmId: r.evidence.resource_score.method.reference.split('/').pop(),
});
export const evidencePathways = (ensgId, efoId) =>
  Promise.all([
    axios.get(
      `${ROOT}public/evidence/filter?size=1000&datasource=reactome&datasource=slapenrich&datasource=progeny&fields=target.activity&fields=disease.efo_info&fields=evidence&fields=access_level&fields=sourceID&target=${ensgId}&disease=${efoId}&expandefo=true`
    ),
    axios.get(
      `${ROOT}public/evidence/filter?size=1000&datasource=crispr&fields=access_level&fields=disease.efo_info&fields=scores&fields=evidence.resource_score.method&target=${ensgId}&disease=${efoId}&expandefo=true`
    ),
    axios.get(
      `${ROOT}public/evidence/filter?size=1000&datasource=sysbio&fields=access_level&fields=target.gene_info&fields=disease.efo_info&fields=disease.id&fields=unique_association_fields&fields=evidence.resource_score.method&target=${ensgId}&disease=${efoId}&expandefo=true`
    ),
  ]).then(([responsePathways, responseCrispr, responseSysBio]) => {
    const pathwaysRaw = responsePathways.data.data;
    const crisprRaw = responseCrispr.data.data;
    const sysBioRaw = responseSysBio.data.data;
    const rowsPathways = pathwaysRaw.map(evidencePathwaysRowTransformer);
    const rowsCrispr = crisprRaw.map(evidenceCrisprRowTransformer);
    const rowsSysBio = sysBioRaw.map(evidenceSysBioRowTransformer);
    const rowsReactome = rowsPathways.filter(
      d => d.source.name === MAP_PATHWAYS_SOURCE.reactome
    );
    const rowsSlapenrich = rowsPathways.filter(
      d => d.source.name === MAP_PATHWAYS_SOURCE.slapenrich
    );
    const rowsProgeny = rowsPathways.filter(
      d => d.source.name === MAP_PATHWAYS_SOURCE.progeny
    );
    const pathwayCount = _.uniqBy(rowsPathways, 'pathway.id').length;
    const reactomeCount = _.uniqBy(rowsReactome, 'pathway.id').length;
    const slapenrichCount = _.uniqBy(rowsSlapenrich, 'pathway.id').length;
    const progenyCount = _.uniqBy(rowsProgeny, 'pathway.id').length;
    const hasCrispr = rowsCrispr.length > 0;
    const hasSysBio = rowsSysBio.length > 0;
    return {
      rowsPathways,
      rowsReactome,
      rowsSlapenrich,
      rowsProgeny,
      rowsCrispr,
      rowsSysBio,
      pathwayCount,
      reactomeCount,
      slapenrichCount,
      progenyCount,
      hasCrispr,
      hasSysBio,
    };
  });

const evidenceDifferentialExpressionRowTransformer = r => {
  return {
    disease: {
      id: r.disease.efo_info.efo_id.split('/').pop(),
      name: r.disease.efo_info.label,
    },
    tissue: {
      id: r.disease.biosample.id.split('/').pop(),
      name: r.disease.biosample.name,
    },
    activity: {
      url: r.evidence.urls[0].url,
      name: r.target.activity.split('_').shift(),
    },
    comparison: r.evidence.comparison_name,
    evidenceSource: r.evidence.evidence_codes_info[0][0].label,
    log2FoldChange: r.evidence.log2_fold_change.value,
    percentileRank: r.evidence.log2_fold_change.percentile_rank,
    pval: r.evidence.resource_score.value,
    experiment: {
      name:
        r.evidence.experiment_overview || 'Experiment overview and raw data',
      url: (r.evidence.urls[2] || r.evidence.urls[0]).url,
    },
    pmIds: r.literature
      ? r.literature.references.map(d => d.lit_id.split('/').pop())
      : [],
  };
};
export const evidenceDifferentialExpression = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=expression_atlas&fields=disease&fields=evidence&fields=target&fields=literature&fields=access_level&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceDifferentialExpressionRowTransformer);
      const experimentCount = _.uniqBy(rows, 'experiment.name').length;
      return { rows, experimentCount };
    });

const evidenceAnimalModelsRowTransformer = r => {
  return {
    disease: {
      id: r.disease.efo_info.efo_id.split('/').pop(),
      name: r.disease.efo_info.label,
    },
    humanPhenotypes: r.evidence.disease_model_association.human_phenotypes.map(
      p => ({ id: p.id, name: p.label, url: p.term_id })
    ),
    modelPhenotypes: r.evidence.disease_model_association.model_phenotypes.map(
      p => ({ id: p.id, name: p.label, url: p.term_id })
    ),
    modelId: r.evidence.biological_model.model_id,
    allelicComposition: r.evidence.biological_model.allelic_composition,
    geneticBackground: r.evidence.biological_model.genetic_background,
    source: {
      name: 'PhenoDigm',
      url: 'https://www.sanger.ac.uk/science/tools/phenodigm',
    },
  };
};
export const evidenceAnimalModels = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=phenodigm&fields=disease&fields=evidence&fields=scores&fields=access_level&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceAnimalModelsRowTransformer);
      const mouseModelCount = _.uniqBy(rows, 'modelId').length;
      return { rows, mouseModelCount };
    });

const cleanVepConsequenceLabel = string =>
  string
    .toUpperCase()
    .replace('5', 'FIVE')
    .replace('3', 'THREE')
    .replace('&APOS;', ' PRIME')
    .replace(/ /g, '_');

const getVepConsequenceLabel = evidenceString => {
  const ecoId = evidenceString.evidence.gene2variant.functional_consequence
    .split('/')
    .pop();
  const eco = evidenceString.evidence.evidence_codes_info.find(
    d => d[0].eco_id === ecoId
  );
  return cleanVepConsequenceLabel(eco[0].label);
};
const evidenceGWASCatalogRowTransformer = r => {
  return {
    disease: {
      id: r.disease.efo_info.efo_id.split('/').pop(),
      name: r.disease.efo_info.label,
    },
    rsId: r.variant.id.split('/').pop(),
    pval: r.evidence.variant2disease.resource_score.value,
    oddsRatio: parseFloat(r.unique_association_fields.odd_ratio),
    confidenceInterval: r.unique_association_fields.confidence_interval,
    vepConsequence: getVepConsequenceLabel(r),
    source: {
      name: 'GWAS Catalog',
      url:
        'https://docs.targetvalidation.org/data-sources/genetic-associations#gwas-catalog',
    },
  };
};
const evidencePheWASCatalogRowTransformer = r => {
  return {
    disease: {
      id: r.disease.efo_info.efo_id.split('/').pop(),
      name: r.disease.efo_info.label,
    },
    rsId: r.variant.id.split('/').pop(),
    pval: r.evidence.variant2disease.resource_score.value,
    oddsRatio: parseFloat(r.unique_association_fields.odds_ratio),
    confidenceInterval: r.unique_association_fields.confidence_interval,
    vepConsequence: getVepConsequenceLabel(r),
    source: {
      name: 'PheWAS Catalog',
      url:
        'https://docs.targetvalidation.org/data-sources/genetic-associations#gwas-catalog',
    },
  };
};
const evidenceEVARowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  rsId: r.variant.id.split('/').pop(),
  clinVarId: r.evidence.gene2variant.urls[0].url.split('/').pop(),
  vepConsequence: getVepConsequenceLabel(r),
  clinicalSignificance: r.evidence.variant2disease.clinical_significance,
  pmId: r.evidence.variant2disease.provenance_type.literature
    ? r.evidence.variant2disease.provenance_type.literature.references[0].lit_id
        .split('/')
        .pop()
    : null,
});
const evidenceEVASomaticRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  rsId: r.unique_association_fields.variant_id,
  clinVarId: r.evidence.urls[0].url.split('/').pop(),
  vepConsequence: cleanVepConsequenceLabel(
    r.evidence.known_mutations[0].preferred_name
  ),
  clinicalSignificance: r.evidence.clinical_significance,
  pmId: r.evidence.provenance_type.literature
    ? r.evidence.provenance_type.literature.references[0].lit_id
        .split('/')
        .pop()
    : null,
});
const evidenceGene2PhenotypeRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  panelsUrl: r.evidence.urls[0].url,
  pmId: r.evidence.provenance_type.literature
    ? r.evidence.provenance_type.literature.references[0].lit_id
        .split('/')
        .pop()
    : null,
});
const evidenceGenomicsEnglandRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  panel: {
    id: r.evidence.urls[0].url.split('/').reverse()[1],
    url: r.evidence.urls[0].url,
  },
  source:
    r.evidence.provenance_type.literature.references.length > 0 &&
    r.evidence.provenance_type.literature.references[0].lit_id !== 'NA'
      ? getMultiplePublicationsSource(
          r.evidence.provenance_type.literature.references.map(d =>
            d.lit_id.split('/').pop()
          )
        )
      : null,
});
export const evidenceGWASCatalog = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=gwas_catalog&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceGWASCatalogRowTransformer);
      const variantCount = _.uniqBy(rows, 'rsId').length;
      return { rows, variantCount };
    });
export const evidencePheWASCatalog = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=phewas_catalog&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidencePheWASCatalogRowTransformer);
      const variantCount = _.uniqBy(rows, 'rsId').length;
      return { rows, variantCount };
    });
export const evidenceEVA = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=eva&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceEVARowTransformer);
      const variantCount = _.uniqBy(rows, 'rsId').length;
      return { rows, variantCount };
    });
export const evidenceEVASomatic = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=eva_somatic&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceEVASomaticRowTransformer);
      const variantCount = _.uniqBy(rows, 'rsId').length;
      return { rows, variantCount };
    });
export const evidenceGene2Phenotype = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=gene2phenotype&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceGene2PhenotypeRowTransformer);
      const hasPanel = rows.length > 0;
      return { rows, hasPanel };
    });
export const evidenceGenomicsEngland = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=genomics_england&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceGenomicsEnglandRowTransformer);
      const hasPanel = rows.length > 0;
      return { rows, hasPanel };
    });

const evidenceIntogenRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  activity: r.target.activity
    .split('/')
    .pop()
    .toUpperCase(),
  inheritancePattern: r.evidence.known_mutations[0].inheritance_pattern.toUpperCase(),
  source: {
    name: r.evidence.urls[0].nice_name,
    url: r.evidence.urls[0].url,
  },
  pmId: r.evidence.provenance_type.literature.references[0].lit_id
    .split('/')
    .pop(),
});
export const evidenceIntogen = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=intogen&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceIntogenRowTransformer);
      const hasMutations = rows.length > 0;
      return { rows, hasMutations };
    });

const inheritancePatternMap = {
  'X-linked recessive': 'X_LINKED_RECESSIVE',
  dominant: 'DOMINANT',
  'dominant/recessive': 'DOMINANT_OR_RECESSIVE',
  recessive: 'RECESSIVE',
  unknown: 'UNKNOWN',
};

const evidenceCancerGeneCensusRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  mutationType: r.evidence.known_mutations[0].preferred_name
    .trim()
    .toUpperCase(),
  inheritancePattern:
    inheritancePatternMap[r.evidence.known_mutations[0].inheritance_pattern],
  source: {
    name: r.evidence.urls[0].nice_name,
    url: r.evidence.urls[0].url,
  },
  samplesWithMutationTypeCount:
    r.evidence.known_mutations[0].number_samples_with_mutation_type,
  mutatedSamplesCount: r.evidence.known_mutations[0].number_mutated_samples,
  pmIds: r.literature
    ? r.literature.references.map(d => d.lit_id.split('/').pop())
    : [],
});
export const evidenceCancerGeneCensus = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=cancer_gene_census&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceCancerGeneCensusRowTransformer);
      const hasMutations = rows.length > 0;
      return { rows, hasMutations };
    });
const evidenceUniProtLiteratureRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  source: {
    name: r.evidence.urls[0].nice_name,
    url: r.evidence.urls[0].url,
  },
  pmIds: r.literature
    ? r.literature.references.map(d => d.lit_id.split('/').pop())
    : [],
});
export const evidenceUniProtLiterature = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=uniprot_literature&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceUniProtLiteratureRowTransformer);
      const hasVariants = rows.length > 0;
      return { rows, hasVariants };
    });
const evidenceUniProtRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  rsId: r.variant.id.split('/').pop(),
  vepConsequence: getVepConsequenceLabel(r),
  source: {
    name: r.evidence.gene2variant.urls[0].nice_name,
    url: r.evidence.gene2variant.urls[0].url,
  },
  pmIds: r.evidence.gene2variant.provenance_type.literature
    ? r.evidence.gene2variant.provenance_type.literature.references.map(d =>
        d.lit_id.split('/').pop()
      )
    : [],
});
export const evidenceUniProt = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=uniprot&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceUniProtRowTransformer);
      const variantCount = _.uniqBy(rows, 'rsId').length;
      return { rows, variantCount };
    });
const evidenceUniProtSomaticRowTransformer = r => ({
  disease: {
    id: r.disease.efo_info.efo_id.split('/').pop(),
    name: r.disease.efo_info.label,
  },
  vepConsequence: r.evidence.known_mutations[0].preferred_name.toUpperCase(),
  source: {
    name: r.evidence.urls[0].nice_name,
    url: r.evidence.urls[0].url,
  },
  pmIds: r.evidence.provenance_type.literature
    ? r.evidence.provenance_type.literature.references.map(d =>
        d.lit_id.split('/').pop()
      )
    : [],
});
export const evidenceUniProtSomatic = (ensgId, efoId) =>
  axios
    .get(
      `${ROOT}public/evidence/filter?size=1000&datasource=uniprot_somatic&target=${ensgId}&disease=${efoId}&expandefo=true`
    )
    .then(response => {
      const rowsRaw = response.data.data;
      const rows = rowsRaw.map(evidenceUniProtSomaticRowTransformer);
      const hasVariants = rows.length > 0;
      return { rows, hasVariants };
    });

// text mining
const evidenceTextMiningRowTransformer = r => {
  const ref = r.evidence.literature_ref;
  const cat_list = [
    'title',
    'intro',
    'result',
    'discussion',
    'conclusion',
    'other',
  ]; // preferred sorting order
  return {
    access: r.access_level,
    relevance: (r.scores.association_score * 5) / 1.66666666,
    disease: {
      id: r.disease.efo_info.efo_id.split('/').pop(),
      name: r.disease.efo_info.label,
    },
    publication: {
      id: ref.data.pmid || ref.data.pmcid || ref.data.id,
      title: ref.data.title,
      date: ref.data.pubYear,
      authors: ref.data.authorList.author.map(auth => ({
        firstName: auth.firstName || auth.initials || '',
        lastName: auth.lastName,
        initials: auth.initials,
      })),
      url: ref.url,
      abstract: ref.data.abstractText,
      matches: ref.mined_sentences
        .map(m => ({
          text: m.text,
          section: m.section.toLowerCase(),
          target: { start: m.t_start, end: m.t_end },
          disease: { start: m.d_start, end: m.d_end },
        }))
        // sort the matches by section based on preferred order
        .sort((a, b) => {
          return (
            cat_list.findIndex(l => a.section.startsWith(l)) -
            cat_list.findIndex(l => b.section.startsWith(l))
          );
        })
        // cluster matches by section for easier display
        .reduce(function(matches, m) {
          const i =
            matches.findIndex(function(a) {
              return (a[0] || {}).section === m.section;
            }) + 1 || matches.push([]);
          matches[i - 1].push(m);
          return matches;
        }, []),
    },
    journal: {
      title:
        ref.data.journalInfo.journal.medlineAbbreviation ||
        ref.data.journalInfo.journal.title ||
        '',
      volume: ref.data.journalInfo.volume || null,
      issue: ref.data.journalInfo.issue || null,
      page: ref.data.pageInfo || null,
      year: ref.data.journalInfo.yearOfPublication,
    },
  };
};

export const evidenceTextMining = (
  ensgId,
  efoId,
  from = 0,
  size = 10,
  sortBy,
  order = ''
) => {
  // map sort field
  // Note that our API only support sorting for selected fields, hence sorting
  // by disease or publication title (the latter not available in our data) is not possible
  let sort;
  const orderPrefix = order.toLowerCase() === 'asc' ? '~' : '';
  // in this case for both supported fields the default order is 'desc'
  // so they both get the same orderPrefix. For certain fields you might have to
  // treat this independently for each sortBy field.
  switch (sortBy) {
    case 'publication.date':
      sort = orderPrefix + 'evidence.date_asserted';
      break;
    default:
      // default sort is by score desc
      sort = orderPrefix + 'scores.association_score';
  }

  return (
    axios
      // get basic literature from our API
      .get(
        `${ROOT}public/evidence/filter?size=${size}&from=${from}&sort=${sort}&datasource=europepmc&search=&fields=access_level&fields=disease.efo_info.label&fields=disease.efo_info.efo_id&fields=evidence.literature_ref&fields=evidence.date_asserted&fields=scores.association_score&target=${ensgId}&disease=${efoId}&expandefo=true`
      )
      .then(response => {
        // get abstract data
        const pmids = response.data.data.map(function(d) {
          return d.evidence.literature_ref.lit_id.split('/').pop();
        });
        const rowsRaw = response.data.data;

        return getAbstractData(pmids).then(abstracts => {
          // Enrich reponse with abstract data
          rowsRaw.forEach(d => {
            d.evidence.literature_ref.data =
              abstracts.find(i => {
                var id = i.pmid || i.id; // some data MIGHT not have a pmid, but id SHOULD be the same
                return id === d.evidence.literature_ref.lit_id.split('/').pop();
              }) || {};
          });
          const rows = rowsRaw.map(evidenceTextMiningRowTransformer);
          const textMiningCount = response.data.total;
          return { rows, textMiningCount };
        });
      })
  );
};

export const evidenceTextMiningSummary = (ensgId, efoId) => {
  return (
    axios
      // get quick literature count from our API
      .get(
        `${ROOT}public/evidence/filter?size=0&datasource=europepmc&target=${ensgId}&disease=${efoId}&expandefo=true`
      )
      .then(response => {
        const textMiningCount = response.data.total;
        return { textMiningCount };
      })
  );
};
