import axios from 'axios';

const API_URL = 'https://www.ebi.ac.uk/gxa/';

// need to specify the body of the post as a string, since
// axios does not do it, even if the request Content-Type header
// is application/x-www-form-urlencoded.
// See https://github.com/axios/axios/issues/362
const expressionAtlas = ensgId => {
  return axios.post(
    `${API_URL}json/baseline_experiments`,
    `species=homo sapiens&geneQuery=${ensgId}`
  );
};

export const expressionsAtlas = ensgIds => {
  return Promise.all(ensgIds.map(ensgId => expressionAtlas(ensgId)));
};
