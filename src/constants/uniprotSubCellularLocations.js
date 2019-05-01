const uniprotSubCellularLocations = require('./uniprotSubCellularLocations.json');

const lookup = uniprotSubCellularLocations.reduce((acc, d) => {
  acc[d.name] = d;
  return acc;
}, {});

export default lookup;
