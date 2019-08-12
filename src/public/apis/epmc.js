import axios from 'axios';

const API_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest/';

export const getAbstractData = symbols => {
  const pmids = symbols
    .map(function(d) {
      return 'ext_id:' + d;
    })
    .join(' OR ');

  return axios
    .get(`${API_URL}search?&format=json&resultType=core&query=${pmids}`)
    .then(res => {
      return res.data.resultList.result;
    })
    .catch(e => {
      throw new Error('Error using Europe PMC API');
    });
};
