import DataLoader from 'dataloader';
import _ from 'lodash';

import { targets, expressions, diseases, targetsDrugs } from './openTargets';
import { expressionsAtlas } from './expressionAtlas';
import { gtexs } from './gtex';
import {
  omnipathInteractionCountsByType,
  omnipathInteractionsSubGraph,
} from './omnipath';
import reactomeTopLevel from '../constants/reactomeTopLevel';
import mousePhenotypesTopLevel from '../constants/mousePhenotypesTopLevel';
import uniprotSubCellularLocations from '../constants/uniprotSubCellularLocations';
import uniprotKeywordsLookup from '../constants/uniprotKeywords';
import getMultiplePublicationsSource from '../utils/getMultiplePublicationsSource';

// Note: dataloader assumes that the response array is in the same
//       order as the passed keys - this must be checked in the
//       batch function

const smallMoleculeTractabilityLevels = [
  // clinical precedence
  {
    label: 'Phase 4',
    bucket: 1,
  },
  {
    label: 'Phase 2 or 3',
    bucket: 2,
  },
  {
    label: 'Phase 0 or 1',
    bucket: 3,
  },
  // discovery precedence
  {
    label: 'PDB targets with ligands',
    bucket: 4,
  },
  {
    label: 'Active compounds in ChEMBL',
    bucket: 7,
  },
  // predicted tractable
  {
    label: 'DrugEBIlity score > 0.7',
    bucket: 5,
  },
  {
    label: 'DrugEBIlity score 0 to 0.7',
    bucket: 6,
  },
  {
    label: 'Druggable genome',
    bucket: 8,
  },
  // unknown
  // {
  //     label: 'Remaining genome',
  //     bucket: 10
  // }
];
const antibodyTractabilityLevels = [
  // clinical precedence
  {
    label: 'Phase 4',
    bucket: 1,
  },
  {
    label: 'Phase 2 or 3',
    bucket: 2,
  },
  {
    label: 'Phase 0 or 1',
    bucket: 3,
  },
  // predicted tractable (high)
  {
    label: 'UniProt location - high confidence',
    bucket: 4,
  },
  {
    label: 'GO cell component - high confidence',
    bucket: 5,
  },
  // predicted tractable (mid-low)
  {
    label: 'UniProt location - low or unknown confidence',
    bucket: 6,
  },
  {
    label: 'UniProt predicted signal peptide or transmembrane region',
    bucket: 7,
  },
  {
    label: 'GO cell component - medium confidence',
    bucket: 8,
  },
  // predicted tractable (HPA)
  {
    label: 'Human Protein Atlas - high confidence',
    bucket: 9,
  },
  // unknown
  // {
  //     label: 'Remaining genome',
  //     bucket: 10
  // }
];
const transformTractability = rawTractability => {
  let hasSmallMoleculeTractabilityAssessment = false;
  let hasAntibodyTractabilityAssessment = false;
  let smallMolecule = null;
  let antibody = null;

  if (rawTractability.smallmolecule) {
    hasSmallMoleculeTractabilityAssessment =
      rawTractability.smallmolecule.buckets.length !== 0;
    smallMolecule = smallMoleculeTractabilityLevels.map(d => ({
      chemblBucket: d.bucket,
      description: d.label,
      value: rawTractability.smallmolecule.buckets.indexOf(d.bucket) >= 0,
    }));
  }

  if (rawTractability.antibody) {
    hasAntibodyTractabilityAssessment =
      rawTractability.antibody.buckets.length !== 0;

    antibody = antibodyTractabilityLevels.map(d => ({
      chemblBucket: d.bucket,
      description: d.label,
      value: rawTractability.antibody.buckets.indexOf(d.bucket) >= 0,
    }));
  }

  return {
    hasSmallMoleculeTractabilityAssessment,
    hasAntibodyTractabilityAssessment,
    smallMolecule,
    antibody,
  };
};

const cancerHallmarkNames = [
  'proliferative signalling',
  'suppression of growth',
  'escaping immunic response to cancer',
  'cell replicative immortality',
  'tumour promoting inflammation',
  'invasion and metastasis',
  'angiogenesis',
  'genome instability and mutations',
  'escaping programmed cell death',
  'change of cellular energetics',
];

export const createExpressionLoader = () => {
  return new DataLoader(keys =>
    expressions(keys).then(({ data }) => {
      return Object.keys(data.data).map(key => {
        const { tissues } = data.data[key];

        const rnaBaselineExpression = tissues.some(
          tissue => tissue.rna.level >= 0
        );
        const proteinBaselineExpression = tissues.some(
          tissue => tissue.protein.level >= 0
        );

        const rows = tissues.map(tissue => {
          return {
            label: tissue.label,
            organs: tissue.organs,
            anatomicalSystems: tissue.anatomical_systems,
            rna: {
              value: tissue.rna.value,
              level: tissue.rna.level,
            },
            protein: {
              level: tissue.protein.level,
            },
          };
        });

        return {
          rnaBaselineExpression,
          proteinBaselineExpression,
          rows,
        };
      });
    })
  );
};

export const createAtlasLoader = () => {
  return new DataLoader(keys =>
    expressionsAtlas(keys).then(data => {
      return data.map(d => ({
        atlasExperiment: d.data.profiles.rows.length > 0,
      }));
    })
  );
};

export const createGtexLoader = () => {
  return new DataLoader(keys =>
    gtexs(keys).then(res => res.map(d => ({ gtexData: d })))
  );
};

export const createTargetLoader = () =>
  new DataLoader(keys =>
    targets(keys).then(([ensgIds, { data }]) => {
      const idMap = data.data.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
      }, {});
      return ensgIds
        .map(d => idMap[d])
        .map(d => {
          const {
            id,
            uniprot_id: uniprotId,
            uniprot_function: uniprotFunction,
            uniprot_subcellular_location: uniprotSubCellularLocation,
            uniprot_subunit: uniprotSubUnit,
            uniprot_keywords: uniprotKeywords,
            approved_symbol: symbol,
            approved_name: name,
            symbol_synonyms: symbolSynonyms,
            name_synonyms: nameSynonyms,
            reactome,
            tractability,
            cancerbiomarkers: cancerBiomarkers,
            chemicalprobes: chemicalProbes,
            mouse_phenotypes: mousePhenotypesGenes,
            go: geneOntologyTerms,
            hallmarks,
          } = d;

          const topLevelPathways = reactomeTopLevel.map(c => {
            return {
              ...c,
              isAssociated: reactome.some(s =>
                s.value['pathway types'].some(p => p['pathway type'] === c.id)
              ),
            };
          });
          const lowLevelPathways = reactome.map(d => ({
            id: d.id,
            name: d.value['pathway name'],
            parents: _.uniqBy(
              d.value['pathway types'].map(d2 => ({
                id: d2['pathway type'],
                name: d2['pathway type name'],
              })),
              'id'
            ),
          }));

          const geneOntology = geneOntologyTerms.reduce(
            (acc, d) => {
              const goId = d.id;
              const [prefix, term] = d.value.term.split(':');
              let category;
              switch (prefix) {
                case 'C':
                  acc.cellularComponentTermsCount += 1;
                  category = 'CELLULAR_COMPONENT';
                  break;
                case 'P':
                  acc.biologicalProcessTermsCount += 1;
                  category = 'BIOLOGICAL_PROCESS';
                  break;
                case 'F':
                  acc.molecularFunctionTermsCount += 1;
                  category = 'MOLECULAR_FUNCTION';
                  break;
              }
              acc.rows.push({
                id: goId,
                term,
                category,
              });
              return acc;
            },
            {
              molecularFunctionTermsCount: 0,
              biologicalProcessTermsCount: 0,
              cellularComponentTermsCount: 0,
              rows: [],
            }
          );
          const cancerHallmarks = {
            promotionAndSuppressionByHallmark: cancerHallmarkNames.map(d => ({
              name: d,
              promotes: (hallmarks ? hallmarks.cancer_hallmarks : [])
                .filter(d2 => d2.label === d)
                .some(d2 => d2.promote),
              suppresses: (hallmarks ? hallmarks.cancer_hallmarks : [])
                .filter(d2 => d2.label === d)
                .some(d2 => d2.suppress),
            })),
            publicationsByHallmark: cancerHallmarkNames
              .map(d => ({
                name: d,
                promotes: (hallmarks ? hallmarks.cancer_hallmarks : [])
                  .filter(d2 => d2.label === d)
                  .some(d2 => d2.promote),
                suppresses: (hallmarks ? hallmarks.cancer_hallmarks : [])
                  .filter(d2 => d2.label === d)
                  .some(d2 => d2.suppress),
                publications: (hallmarks ? hallmarks.cancer_hallmarks : [])
                  .filter(d2 => d2.label === d)
                  .map(d2 => ({
                    pmId: d2.pmid,
                    description: d2.description,
                  })),
              }))
              .filter(d => d.publications.length > 0),
            roleInCancer: (hallmarks ? hallmarks.attributes : [])
              .filter(d => d.attribute_name === 'role in cancer')
              .map(d => ({ name: d.description, pmId: d.pmid })),
            rows: (hallmarks ? hallmarks.cancer_hallmarks : []).map(d => ({
              name: d.label,
              description: d.description,
              promotes: d.promote,
              suppresses: d.suppress,
              pmId: d.pmid,
            })),
          };

          const proteinInteractions = {
            counts: omnipathInteractionCountsByType(uniprotId),
            subGraph: omnipathInteractionsSubGraph(uniprotId),
          };

          const mousePhenotypesRows =
            mousePhenotypesGenes && Array.isArray(mousePhenotypesGenes)
              ? mousePhenotypesGenes.reduce((acc, mouseGene) => {
                  const {
                    mouse_gene_id: mouseGeneId,
                    mouse_gene_symbol: mouseGeneSymbol,
                    phenotypes,
                  } = mouseGene;
                  phenotypes.forEach(category => {
                    const {
                      category_mp_identifier: categoryId,
                      category_mp_label: categoryLabel,
                      genotype_phenotype: categoryPhenotypes,
                    } = category;
                    categoryPhenotypes.forEach(phenotype => {
                      const {
                        mp_identifier: phenotypeId,
                        mp_label: phenotypeLabel,
                        pmid: pmId,
                        subject_allelic_composition: subjectAllelicComposition,
                        subject_background: subjectBackground,
                      } = phenotype;
                      const pmIds = pmId.split(',');
                      acc.push({
                        mouseGeneId,
                        mouseGeneSymbol,
                        categoryId,
                        categoryLabel,
                        phenotypeId,
                        phenotypeLabel,
                        subjectAllelicComposition,
                        subjectBackground,
                        pmIds,
                      });
                    });
                  });
                  return acc;
                }, [])
              : [];
          const mousePhenotypesPhenotypeCount = Object.keys(
            mousePhenotypesRows.reduce((acc, d) => {
              acc[d.phenotypeId] = true;
              return acc;
            }, {})
          ).length;
          const mousePhenotypesCategoryCount = Object.keys(
            mousePhenotypesRows.reduce((acc, d) => {
              acc[d.categoryId] = true;
              return acc;
            }, {})
          ).length;
          const mousePhenotypesCategories = mousePhenotypesTopLevel.map(c => {
            return {
              ...c,
              isAssociated: mousePhenotypesRows.some(
                d => d.categoryId === c.id
              ),
            };
          });
          const mousePhenotypes = {
            phenotypeCount: mousePhenotypesPhenotypeCount,
            categoryCount: mousePhenotypesCategoryCount,
            categories: mousePhenotypesCategories,
            rows: mousePhenotypesRows,
          };

          return {
            id,
            symbol,
            name,
            description: uniprotFunction ? uniprotFunction[0] : null,
            synonyms: _.uniqWith(
              [...symbolSynonyms, ...nameSynonyms],
              (a, b) => a.toLowerCase() === b.toLowerCase()
            ),
            geneOntology,
            pathways: {
              count: reactome.length,
              lowLevelPathways,
              topLevelPathways,
            },
            cancerHallmarks,
            cancerBiomarkers: {
              hasCancerBiomarkers:
                cancerBiomarkers && cancerBiomarkers.length > 0 ? true : false,
              cancerBiomarkerCount: cancerBiomarkers
                ? _.uniq(cancerBiomarkers.map(d => d.biomarker)).length
                : 0,
              drugCount: cancerBiomarkers
                ? _.uniq(cancerBiomarkers.map(d => d.drugfullname)).length
                : 0,
              diseaseCount: cancerBiomarkers
                ? _.uniq(
                    cancerBiomarkers.reduce((acc, d) => {
                      return acc.concat(d.diseases.map(d2 => d2.id));
                    }, [])
                  ).length
                : 0,
              rows: cancerBiomarkers
                ? cancerBiomarkers.map(r => {
                    const publicationSource = getMultiplePublicationsSource(
                      r.references.pubmed.map(d2 => d2.pmid) || []
                    );
                    const otherSources = (r.references.other || []).map(d2 => ({
                      url: d2.link,
                      name: d2.name,
                    }));
                    const sources = [
                      ...(publicationSource ? [publicationSource] : []),
                      ...otherSources,
                    ];
                    const associationType = r.association
                      .replace(' ', '_')
                      .toUpperCase();
                    return {
                      biomarker: r.individualbiomarker || r.biomarker,
                      diseases: r.diseases.map(d2 => ({
                        _efoId: d2.id, // needed if other disease fields are queried
                        id: d2.id,
                        name: d2.label,
                      })),
                      drugName: r.drugfullname,
                      associationType,
                      evidenceLevel: r.evidencelevel,
                      sources,
                    };
                  })
                : [],
            },
            tractability: transformTractability(tractability),
            chemicalProbes: {
              hasStructuralGenomicsConsortium:
                chemicalProbes &&
                chemicalProbes.portalprobes &&
                chemicalProbes.portalprobes.some(d =>
                  d.sourcelinks.some(
                    d2 => d2.source === 'Structural Genomics Consortium'
                  )
                )
                  ? true
                  : false,
              hasChemicalProbesPortal:
                chemicalProbes &&
                chemicalProbes.portalprobes &&
                chemicalProbes.portalprobes.some(d =>
                  d.sourcelinks.some(
                    d2 => d2.source === 'Chemical Probes Portal'
                  )
                )
                  ? true
                  : false,
              hasOpenScienceProbes:
                chemicalProbes &&
                chemicalProbes.portalprobes &&
                chemicalProbes.portalprobes.some(d =>
                  d.sourcelinks.some(d2 => d2.source === 'Open Science Probes')
                )
                  ? true
                  : false,
              hasProbeMiner:
                chemicalProbes && chemicalProbes.probeminer ? true : false,

              // portalProbeCount:
              //   chemicalProbes && chemicalProbes.portalprobes
              //     ? chemicalProbes.portalprobes.length
              //     : 0,
              // hasProbeMinerLink:
              //   chemicalProbes && chemicalProbes.probeminer ? true : false,
              rows:
                chemicalProbes && chemicalProbes.portalprobes
                  ? chemicalProbes.portalprobes.map(d => {
                      return {
                        chemicalProbe: d.chemicalprobe,
                        note: d.note !== 'none' ? d.note : '',
                        sources: d.sourcelinks.map(sl => ({
                          url:
                            sl.link.toLowerCase().substring(0, 4) === 'http'
                              ? sl.link
                              : 'http://' + sl.link,
                          name: sl.source,
                        })),
                      };
                    })
                  : [],
              probeMinerUrl:
                chemicalProbes && chemicalProbes.probeminer
                  ? chemicalProbes.probeminer.link
                  : null,
            },
            protein: {
              uniprotId,
              uniprotKeywords: uniprotKeywords.map(
                d => uniprotKeywordsLookup[d]
              ),
              uniprotSubUnit,
              hasProtVista: uniprotId ? true : false,
              uniprotSubCellularLocations: uniprotSubCellularLocation.map(
                d => uniprotSubCellularLocations[d]
              ),
            },
            mousePhenotypes,
            proteinInteractions,
          };
        });
    })
  );

export const createDiseaseLoader = () =>
  new DataLoader(keys =>
    diseases(keys).then(([efoIds, { data }]) => {
      const idMap = data.data.reduce((acc, obj) => {
        const efoId = obj.code.split('/').pop();
        acc[efoId] = { id: efoId, ...obj };
        return acc;
      }, {});
      return efoIds
        .map(d => idMap[d])
        .map(d => {
          // TODO: Remove this condition when this is fixed https://github.com/opentargets/platform/issues/486
          if (!d) {
            return { id: 'UNKNOWN' };
          }

          const {
            id,
            label: name,
            definition: description,
            efo_synonyms: synonyms,
            path_codes: pathCodes,
            path_labels: pathLabels,
            phenotypes: phenotypesRaw,
          } = d;
          const therapeuticAreas = _.uniqBy(
            _.zip(pathCodes.map(d => d[0]), pathLabels.map(d => d[0])).map(
              l => ({ _efoId: l[0], id: l[0], name: l[1] })
            ),
            'id'
          );
          const phenotypes = phenotypesRaw.map(d => ({
            id: d.uri.split('/').pop(),
            name: d.label,
            url: d.uri,
          }));
          return {
            id,
            name,
            description,
            synonyms: synonyms.length > 0 ? synonyms : [],
            therapeuticAreas:
              therapeuticAreas.length > 0 ? therapeuticAreas : [],
            phenotypes,
          };
        });
    })
  );

const MAP_ACTIVITY = {
  drug_positive_modulator: 'agonist',
  drug_negative_modulator: 'antagonist',
  up_or_down: 'up_or_down',
};

export const createTargetDrugsLoader = () =>
  new DataLoader(keys =>
    targetsDrugs(keys).then(([ensgIds, data]) => {
      return ensgIds.map(ensgId => {
        const relevantRows = data.filter(d => d.target.id === ensgId);
        const drugs = _.uniqBy(relevantRows, 'drug.molecule_name');
        const trials = _.uniqBy(
          relevantRows,
          d => d.evidence.drug2clinic.urls[0].url
        );
        const drugCount = drugs.length;
        const drugModalities = {
          antibody: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === 'antibody'
          ).length,
          enzyme: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === 'enzyme'
          ).length,
          oligonucleotide: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === 'oligonucleotide'
          ).length,
          oligosaccharide: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === 'oligosaccharide'
          ).length,
          protein: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === 'protein'
          ).length,
          smallMolecule: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === 'small molecule'
          ).length,
          other: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === 'other'
          ).length,
        };
        const phaseCounts = trials.reduce(
          (acc, t) => {
            const phase =
              t.evidence.drug2clinic.clinical_trial_phase.numeric_index;
            acc[phase] += 1;
            return acc;
          },
          { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
        );
        const trialsByPhase = Object.keys(phaseCounts).map(p => ({
          phase: p,
          trialCount: phaseCounts[p],
        }));
        const rows = relevantRows.map(r => {
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
        });

        return {
          drugCount,
          drugModalities,
          trialsByPhase,
          rows,
        };
      });
    })
  );
