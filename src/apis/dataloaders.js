import DataLoader from "dataloader";
import _ from "lodash";

import { targets, targetsDrugs } from "./openTargets";
import reactomeTopLevel from "../constants/reactomeTopLevel";
import mousePhenotypesTopLevel from "../constants/mousePhenotypesTopLevel";
import getMultiplePublicationsSource from "../utils/getMultiplePublicationsSource";

// Note: dataloader assumes that the response array is in the same
//       order as the passed keys - this must be checked in the
//       batch function

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
            uniprot_subcellular_location: uniprotSubcellularLocation,
            uniprot_subunit: uniprotSubunit,
            uniprot_keywords: uniprotKeywords,
            approved_symbol: symbol,
            approved_name: name,
            symbol_synonyms: symbolSynonyms,
            name_synonyms: nameSynonyms,
            reactome,
            cancerbiomarkers: cancerBiomarkers,
            chemicalprobes: chemicalProbes,
            mouse_phenotypes: mousePhenotypeGenes,
          } = d;

          const pathwayCategories = reactomeTopLevel.map(c => {
            return {
              ...c,
              isAssociated: reactome.some(s =>
                s.value["pathway types"].some(p => p["pathway type"] === c.id)
              ),
            };
          });
          const mousePhenotypeCategories = mousePhenotypesTopLevel.map(c => {
            return {
              ...c,
              isAssociated: mousePhenotypeGenes.some(g =>
                g.phenotypes
                  .filter(p => p.genotype_phenotype.length > 0)
                  .some(p => p.category_mp_identifier === c.id)
              ),
            };
          });

          return {
            id,
            symbol,
            name,
            description: uniprotFunction ? uniprotFunction[0] : null,
            synonyms: _.uniqWith(
              [...symbolSynonyms, ...nameSynonyms],
              (a, b) => a.toLowerCase() === b.toLowerCase()
            ),
            pathways: {
              count: reactome.length,
              pathwayCategories,
            },
            cancerBiomarkers: {
              hasCancerBiomarkers:
                cancerBiomarkers && cancerBiomarkers.length > 0,
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
                      .replace(" ", "_")
                      .toUpperCase();
                    return {
                      diseases: r.diseases.map(d2 => ({
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
            chemicalProbes: {
              hasStructuralGenomicsConsortium:
                chemicalProbes &&
                chemicalProbes.portalprobes &&
                chemicalProbes.portalprobes.some(d =>
                  d.sourcelinks.some(
                    d2 => d2.source === "Structural Genomics Consortium"
                  )
                ),
              hasChemicalProbesPortal:
                chemicalProbes &&
                chemicalProbes.portalprobes &&
                chemicalProbes.portalprobes.some(d =>
                  d.sourcelinks.some(
                    d2 => d2.source === "Chemical Probes Portal"
                  )
                ),
              hasOpenScienceProbes:
                chemicalProbes &&
                chemicalProbes.portalprobes &&
                chemicalProbes.portalprobes.some(d =>
                  d.sourcelinks.some(d2 => d2.source === "Open Science Probes")
                ),
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
                        note: d.note !== "none" ? d.note : "",
                        sources: d.sourcelinks.map(sl => ({
                          url:
                            sl.link.toLowerCase().substring(0, 4) === "http"
                              ? sl.link
                              : "http://" + sl.link,
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
              uniprotKeywords,
              uniprotSubcellularLocation,
              uniprotSubunit,
              hasProtVista: uniprotId ? true : false,
              subcellularLocation: uniprotSubcellularLocation,
            },
            mousePhenotypes: {
              phenotypeCategories: mousePhenotypeCategories,
            },
          };
        });
    })
  );

const MAP_ACTIVITY = {
  drug_positive_modulator: "agonist",
  drug_negative_modulator: "antagonist",
  up_or_down: "up_or_down",
};

export const createTargetDrugsLoader = () =>
  new DataLoader(keys =>
    targetsDrugs(keys).then(([ensgIds, data]) => {
      return ensgIds.map(ensgId => {
        const relevantRows = data.filter(d => d.target.id === ensgId);
        const drugs = _.uniqBy(relevantRows, "drug.molecule_name");
        const trials = _.uniqBy(
          relevantRows,
          d => d.evidence.drug2clinic.urls[0].url
        );
        const drugCount = drugs.length;
        const drugModalities = {
          antibody: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === "antibody"
          ).length,
          enzyme: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === "enzyme"
          ).length,
          oligonucleotide: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === "oligonucleotide"
          ).length,
          oligosaccharide: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === "oligosaccharide"
          ).length,
          protein: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === "protein"
          ).length,
          smallMolecule: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === "small molecule"
          ).length,
          other: drugs.filter(
            r => r.drug.molecule_type.toLowerCase() === "other"
          ).length,
        };
        const phaseCounts = trials.reduce(
          (acc, t) => {
            const phase =
              t.evidence.drug2clinic.max_phase_for_disease.numeric_index;
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
              id: r.disease.efo_info.efo_id.split("/").pop(),
              name: r.disease.efo_info.label,
            },
            drug: {
              id: r.drug.id.split("/").pop(),
              name: r.drug.molecule_name,
              type: r.drug.molecule_type.replace(" ", "_").toUpperCase(),
              activity: MAP_ACTIVITY[r.target.activity].toUpperCase(),
            },
            clinicalTrial: {
              phase: r.evidence.drug2clinic.max_phase_for_disease.numeric_index,
              status: r.evidence.drug2clinic.status
                ? r.evidence.drug2clinic.status
                    .replace(/\s+/g, "_")
                    .replace(",", "")
                    .toUpperCase()
                : null,
              sourceName: r.evidence.drug2clinic.urls[0].nice_name.replace(
                " Information",
                ""
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
