import omnipathData from '../data/omnipath/interactions.json';
import omnipathCategories from '../data/omnipath/interactionCategories.json';
import uniprotToGene from '../data/uniprot/uniprotIdToGene.json';

const getInteractionCountsByType = interactions => {
  let ppi = 0;
  let pathways = 0;
  let enzymeSubstrate = 0;

  interactions.forEach(interaction => {
    let hasContributedToPathways = false;
    let hasContributedToPPI = false;
    let hasContributedToEnzymeSubstrate = false;

    const { sources } = interaction;

    sources.forEach(source => {
      if (omnipathCategories.Pathways[source]) {
        if (!hasContributedToPathways) {
          pathways++;
          hasContributedToPathways = true;
        }
      } else if (omnipathCategories.PPI[source]) {
        if (!hasContributedToPPI) {
          ppi++;
          hasContributedToPPI = true;
        }
      } else if (omnipathCategories.EnzymeSubstrate[source]) {
        if (!hasContributedToEnzymeSubstrate) {
          enzymeSubstrate++;
          hasContributedToEnzymeSubstrate = true;
        }
      }
    });
  });

  return {
    ppi,
    pathways,
    enzymeSubstrate,
  };
};

const getInteractionsForUniprotId = uniprotId =>
  omnipathData
    .filter(d => d.source === uniprotId || d.target === uniprotId)
    .filter(d =>
      d.sources.some(
        s =>
          omnipathCategories.Pathways[s] ||
          omnipathCategories.PPI[s] ||
          omnipathCategories.EnzymeSubstrate[s]
      )
    );

export const omnipathInteractionCountsByType = uniprotId => {
  const omnipathFiltered = getInteractionsForUniprotId(uniprotId);
  return getInteractionCountsByType(omnipathFiltered);
};

export const omnipathInteractionsSubGraph = uniprotId => {
  const omnipathFiltered = getInteractionsForUniprotId(uniprotId);
  const acceptedUniprotIds = Object.keys(uniprotToGene); // omnipath contains eg. Q9Y6C7 which is not mapped to ensembl

  // get neighbours
  const neighboursObj = {};
  omnipathFiltered
    .filter(d => d.source === uniprotId)
    .forEach(d => (neighboursObj[d.target] = true));
  omnipathFiltered
    .filter(d => d.target === uniprotId)
    .forEach(d => (neighboursObj[d.source] = true));
  const neighbours = Object.keys(neighboursObj);
  const selfAndNeighbours = [uniprotId, ...neighbours].filter(
    d => acceptedUniprotIds.indexOf(d) >= 0
  );

  // get nodes
  const nodes = uniprotId
    ? selfAndNeighbours.map(d => ({
        uniprotId: d,
        ensgId: uniprotToGene[d].ensgId,
        symbol: uniprotToGene[d].symbol,
      }))
    : [];

  // get edges
  const interactions = omnipathData.filter(
    d =>
      selfAndNeighbours.indexOf(d.source) >= 0 &&
      selfAndNeighbours.indexOf(d.target) >= 0
  );
  const edges = interactions.map(d => ({
    source: d.source,
    target: d.target,
    isDirected: d.is_directed === 1 ? true : false,
    isStimulation: d.is_stimulation === 1 ? true : false,
    isInhibition: d.is_inhibition === 1 ? true : false,
    pmIds: d.references.map(r => `${r}`),
    sources: d.sources,
    pathwaysSources: d.sources.filter(s => omnipathCategories.Pathways[s]),
    enzymeSubstrateSources: d.sources.filter(
      s => omnipathCategories.EnzymeSubstrate[s]
    ),
    ppiSources: d.sources.filter(s => omnipathCategories.PPI[s]),
  }));

  return { nodes, edges };
};
