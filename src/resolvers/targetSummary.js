import _ from "lodash";
import { target, targetDrugs, targetSimilar } from "../apis/openTargets";

const targetSummary = (obj, { ensgId }) => {
  return Promise.all([
    target(ensgId),
    targetDrugs(ensgId),
    targetSimilar(ensgId),
  ]).then(([targetResponse, targetDrugsResponse, targetSimilarResponse]) => {
    const {
      uniprot_id: uniprotId,
      uniprot_function: uniprotFunction,
      uniprot_subcellular_location: uniprotSubcellularLocation,
      approved_symbol: symbol,
      approved_name: name,
      symbol_synonyms: symbolSynonyms,
      name_synonyms: nameSynonyms,
      reactome,
      cancerbiomarkers: cancerBiomarkers,
      chemicalprobes: chemicalProbes,
    } = targetResponse.data;

    const drugCount = _.uniq(
      targetDrugsResponse.data.data.map(d => d.drug.molecule_name)
    ).length;
    const drugModalities = targetDrugsResponse.data.data.reduce(
      (acc, d) => {
        if (d.drug.molecule_type) {
          switch (d.drug.molecule_type.toLowerCase()) {
            case "antibody":
              acc.antibody = true;
              break;
            case "peptide":
              acc.peptide = true;
              break;
            case "protein":
              acc.protein = true;
              break;
            case "small molecule":
              acc.smallMolecule = true;
              break;
          }
        }
        return acc;
      },
      {
        antibody: false,
        peptide: false,
        protein: false,
        smallMolecule: false,
      }
    );
    const drugTrialsByPhase = targetDrugsResponse.data.data
      .reduce(
        (acc, d) => {
          acc[d.evidence.drug2clinic.max_phase_for_disease.numeric_index] += 1;
          return acc;
        },
        [0, 0, 0, 0, 0]
      )
      .map((d, i) => ({ phase: i, trialCount: d }));

    const similarTargetsCount = targetSimilarResponse.data.data.length;
    const similarTargetsAverageCommonDiseases =
      similarTargetsCount > 0
        ? targetSimilarResponse.data.data.reduce((acc, d) => {
            acc += d.shared_diseases.length;
            return acc;
          }, 0) / similarTargetsCount
        : 0;

    return {
      id: ensgId,
      name,
      symbol,
      description: uniprotFunction ? uniprotFunction[0] : null,
      synonyms: _.uniqWith(
        [...symbolSynonyms, ...nameSynonyms],
        (a, b) => a.toLowerCase() === b.toLowerCase()
      ),
      pathways: {
        count: reactome.length,
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
      },
      drugs: {
        count: drugCount,
        modalities: drugModalities,
        trialsByPhase: drugTrialsByPhase,
      },
      protein: {
        hasProtVista: uniprotId ? true : false,
        subcellularLocation: uniprotSubcellularLocation,
      },
      similarTargets: {
        count: similarTargetsCount,
        averageCommonDiseases: Math.round(similarTargetsAverageCommonDiseases),
      },
    };
  });
};

export default targetSummary;
