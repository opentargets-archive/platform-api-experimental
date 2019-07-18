import axios from 'axios';
import _ from 'lodash';
import { getAbstractData } from './epmc';

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
const MAP_ACTIVITY = {
  drug_positive_modulator: 'agonist',
  drug_negative_modulator: 'antagonist',
  up_or_down: 'up_or_down',
};
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
      activity: MAP_ACTIVITY[r.target.activity].toUpperCase(),
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
  gain_of_function: 'GAIN_OF_FUNCTION',
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
  };
};
export const evidencePathways = (ensgId, efoId) =>
  Promise.all([
    axios.get(
      `${ROOT}public/evidence/filter?size=1000&datasource=reactome&datasource=slapenrich&datasource=progeny&fields=target.activity&fields=disease.efo_info&fields=evidence&fields=access_level&fields=sourceID&target=${ensgId}&disease=${efoId}&expandefo=true`
    ),
    axios.get(
      `${ROOT}public/evidence/filter?size=1000&datasource=crispr&fields=access_level&fields=disease.name&fields=disease.id&fields=scores&fields=evidence.resource_score.method&target=${ensgId}&disease=${efoId}&expandefo=true`
    ),
  ]).then(([responsePathways, responseCrispr]) => {
    const pathwaysRaw = responsePathways.data.data;
    const rowsPathways = pathwaysRaw.map(evidencePathwaysRowTransformer);
    const pathwayCount = _.uniqBy(rowsPathways, 'pathway.id').length;
    return { rowsPathways, pathwayCount };
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
    disease: {
      id: r.disease.efo_info.efo_id.split('/').pop(),
      name: r.disease.efo_info.label,
    },
    publication: {
      id: ref.data.pmid || ref.data.pmcid || ref.data.id,
      title: ref.data.title,
      date: ref.data.pubYear,
      authors: ref.data.authorList.author.map(auth => ({
        firstName: auth.firstName,
        lastName: auth.lastName,
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

export const evidenceTextMining = (ensgId, efoId) => {
  return (
    axios
      // get basic literature from our API
      .get(
        `${ROOT}public/evidence/filter?size=10&from=0&datasource=europepmc&sort=evidence.date_asserted&search=&fields=access_level&fields=disease.efo_info.label&fields=disease.efo_info.efo_id&fields=evidence.literature_ref&fields=evidence.date_asserted&target=${ensgId}&disease=${efoId}&expandefo=true`
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
  console.log('evidenceTextMining ', ensgId, efoId);
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
