import axios from 'axios';
import _ from 'lodash';

const PROTOCOL = 'https';
const HOST = 'rest.ensembl.org';
const ROOT = `${PROTOCOL}://${HOST}/`;

const scientificName2CommonName = {
  homo_sapiens: 'Human',
  mus_musculus_reference: 'Mouse',
  mus_musculus: 'Mouse',
  cavia_porcellus: 'Guinea pig',
  macaca_mulatta: 'Macaque',
  canis_lupus_familiaris: 'Dog',
  canis_familiaris: 'Dog',
  oryctolagus_cuniculus: 'Rabbit',
  rattus_norvegicus: 'Rat',
  sus_scrofa: 'Pig',
  xenopus_tropicalis: 'Frog',
  danio_rerio: 'Zebrafish',
  drosophila_melanogaster: 'Fly',
  caenorhabditis_elegans: 'Worm',
  pan_troglodytes: 'Chimpanzee',
  'mus_musculus_reference_(CL57BL6)': 'Mouse',
  caenorhabditis_elegans_N2: 'Worm',
};

const speciesSubset = [
  // 'homo_sapiens',
  'pan_troglodytes',

  'macaca_mulatta',
  'sus_scrofa',
  'canis_familiaris',
  'oryctolagus_cuniculus',
  'mus_musculus',

  'rattus_norvegicus',
  'cavia_porcellus',
  'xenopus_tropicalis',
  'danio_rerio',
  'drosophila_melanogaster',
  'caenorhabditis_elegans',
];

var homologyTypeDictionary = {
  ortholog_one2one: 'orthologue: 1 to 1',
  ortholog_one2many: 'orthologue: 1 to many',
  within_species_paralog: 'paralogue',
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
            const rows = homologies
              .filter(
                d => Object.keys(homologyTypeDictionary).indexOf(d.type) >= 0
              )
              .map(d => ({
                dNdS: d.dn_ds,
                species: scientificName2CommonName[d.target.species],
                speciesId: d.target.species,
                homologyType: homologyTypeDictionary[d.type],
                queryPercentageIdentity: d.source.perc_id,
                targetPercentageIdentity: d.target.perc_id,
                targetGeneId: d.target.id,
                targetGeneSymbol: targetIdLookup[d.target.id].display_name,
              }));
            const orthologuesBySpecies = speciesSubset.map(speciesId => ({
              speciesId,
              species: scientificName2CommonName[speciesId],
              orthologuesCount: rows.filter(
                r =>
                  r.speciesId === speciesId &&
                  (r.homologyType ===
                    homologyTypeDictionary['ortholog_one2one'] ||
                    r.homologyType ===
                      homologyTypeDictionary['ortholog_one2many'])
              ).length,
            }));
            const paraloguesCount = rows.filter(
              r =>
                r.homologyType ===
                homologyTypeDictionary['within_species_paralog']
            ).length;
            return { rows, orthologuesBySpecies, paraloguesCount };
          });
      } else {
        return [];
      }
    });
