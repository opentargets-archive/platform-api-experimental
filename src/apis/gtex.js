import axios from 'axios';

const API_URL = 'https://www.gtexportal.org/rest/v1/';

export const hasGtexData = symbol => {
  return axios
    .get(`${API_URL}reference/gene?geneId=${symbol}&v=clversion`)
    .then(res => {
      if (res.data.gene.length === 0) {
        return false;
      }

      const gencodeId = res.data.gene[0].gencodeId;

      return axios
        .get(`${API_URL}expression/geneExpression?gencodeId=${gencodeId}`)
        .then(res => {
          return res.data.geneExpression.length > 0;
        });
    });
};

export const gtexs = symbols => {
  return Promise.all(symbols.map(symbol => hasGtexData(symbol)));
};
