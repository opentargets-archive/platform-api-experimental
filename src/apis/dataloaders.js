import DataLoader from "dataloader";
import _ from "lodash";

import { targets } from "./openTargets";
import reactomeTopLevel from "../constants/reactomeTopLevel";
import mousePhenotypesTopLevel from "../constants/mousePhenotypesTopLevel";

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
              count: cancerBiomarkers
                ? _.uniq(cancerBiomarkers.map(d => d.biomarker)).length
                : 0,
              diseaseCount: cancerBiomarkers
                ? _.uniq(
                    cancerBiomarkers.reduce((acc, d) => {
                      return acc.concat(d.diseases.map(d2 => d2.id));
                    }, [])
                  ).length
                : 0,
            },
            chemicalProbes: {
              portalProbeCount:
                chemicalProbes && chemicalProbes.portalprobes
                  ? chemicalProbes.portalprobes.length
                  : 0,
              hasProbeMinerLink:
                chemicalProbes && chemicalProbes.probeminer ? true : false,
              probeMinerLink:
                chemicalProbes && chemicalProbes.probeminer
                  ? chemicalProbes.probeminer.link
                  : "",
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
