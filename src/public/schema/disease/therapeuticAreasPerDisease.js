import * as d3Base from 'd3';
import * as d3DagBase from 'd3-dag';

import efo from '../../data/efo/efo3.1911.hacked.json';
import therapeuticAreaIds from '../../data/efo/efo3.therapeuticAreas.hacked.json';

const d3 = Object.assign({}, d3Base, d3DagBase);

const dag = d3.dagStratify()(Object.values(efo));

const namesPerDiseaseId = efo.reduce((acc, d) => {
  acc[d.id] = d.name;
  return acc;
}, {});

const therapeuticAreasPerDisease = therapeuticAreaIds.reduce((acc, taId) => {
  dag
    .descendants()
    .find(d => d.id === taId)
    .descendants()
    .forEach(d => {
      if (!acc[d.id]) {
        acc[d.id] = [];
      }
      acc[d.id].push({ id: taId, name: namesPerDiseaseId[taId] });
    });
  return acc;
}, {});

export default therapeuticAreasPerDisease;
