import axios from "axios";
import _ from "lodash";

const PROTOCOL = "https";
const HOST = "rest.ensembl.org";
const ROOT = `${PROTOCOL}://${HOST}/`;

const scientificName2CommonName = {
  homo_sapiens: "Human",
  mus_musculus_reference: "Mouse",
  mus_musculus: "Mouse",
  cavia_porcellus: "Guinea pig",
  macaca_mulatta: "Macaque",
  canis_lupus_familiaris: "Dog",
  canis_familiaris: "Dog",
  oryctolagus_cuniculus: "Rabbit",
  rattus_norvegicus: "Rat",
  sus_scrofa: "Pig",
  xenopus_tropicalis: "Frog",
  danio_rerio: "Zebrafish",
  drosophila_melanogaster: "Fly",
  caenorhabditis_elegans: "Worm",
  pan_troglodytes: "Chimpanzee",
  "mus_musculus_reference_(CL57BL6)": "Mouse",
  caenorhabditis_elegans_N2: "Worm",
};

export const homologyTable = ensgId =>
  axios
    .get(
      `${ROOT}homology/id/${ensgId}.json?format=full;sequence=none;type=all;target_taxon=9606;target_taxon=10090;target_taxon=10141;target_taxon=9544;target_taxon=9615;target_taxon=9986;target_taxon=10116;target_taxon=9823;target_taxon=8364;target_taxon=7955;target_taxon=9598;target_taxon=7227;target_taxon=6239`
    )
    .then(response => {
      if (response.data.data && response.data.data.length === 1) {
        const { homologies } = response.data.data[0];
        const targetIds = homologies.map(d => d.target.id);
        return axios
          .post(`${ROOT}lookup/id/`, { ids: targetIds })
          .then(response2 => {
            const targetIdLookup = response2.data;
            const rows = homologies.map(d => ({
              dNdS: d.dn_ds,
              species: scientificName2CommonName[d.target.species],
              queryPercentageIdentity: d.source.perc_id,
              targetPercentageIdentity: d.target.perc_id,
              targetGeneId: d.target.id,
              targetGeneSymbol: targetIdLookup[d.target.id].display_name,
            }));
            return rows;
          });
      } else {
        return [];
      }
    });
