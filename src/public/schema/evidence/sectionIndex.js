// TODO: see if this can be done dynamically
//       or try @babel/plugin-proposal-export-namespace-from (may need eject)

import * as animalModelsRaw from './sections/AnimalModels';
import * as differentialExpressionRaw from './sections/DifferentialExpression';
import * as drugsRaw from './sections/Drugs';
import * as gwasCatalogRaw from './sections/GWASCatalog';
import * as intogenRaw from './sections/IntOGen';
import * as cancerGeneCensusRaw from './sections/CancerGeneCensus';
// import * as pathwaysRaw from './sections/Pathways';
import * as phewasCatalogRaw from './sections/PheWASCatalog';
import * as reactomeRaw from './sections/Reactome';
import * as slapenrichRaw from './sections/SLAPenrich';
import * as progenyRaw from './sections/PROGENy';
import * as crisprRaw from './sections/CRISPR';
import * as sysBioRaw from './sections/SysBio';
import * as evaRaw from './sections/EVA';
import * as gene2PhenotypeRaw from './sections/Gene2Phenotype';
import * as genomicsEnglandRaw from './sections/GenomicsEngland';

export const animalModels = animalModelsRaw;
export const differentialExpression = differentialExpressionRaw;
export const drugs = drugsRaw;
export const gwasCatalog = gwasCatalogRaw;
export const intogen = intogenRaw;
export const cancerGeneCensus = cancerGeneCensusRaw;
// export const pathways = pathwaysRaw;
export const phewasCatalog = phewasCatalogRaw;
export const reactome = reactomeRaw;
export const slapenrich = slapenrichRaw;
export const progeny = progenyRaw;
export const crispr = crisprRaw;
export const sysBio = sysBioRaw;
export const eva = evaRaw;
export const gene2Phenotype = gene2PhenotypeRaw;
export const genomicsEngland = genomicsEnglandRaw;
