// TODO: see if this can be done dynamically
//       or try @babel/plugin-proposal-export-namespace-from (may need eject)

import * as animalModelsRaw from './sections/AnimalModels';
import * as differentialExpressionRaw from './sections/DifferentialExpression';
import * as drugsRaw from './sections/Drugs';
import * as gwasCatalogRaw from './sections/GWASCatalog';
// import * as pathwaysRaw from './sections/Pathways';
import * as phewasCatalogRaw from './sections/PheWASCatalog';
import * as reactomeRaw from './sections/Reactome';
import * as slapenrichRaw from './sections/SLAPenrich';
import * as progenyRaw from './sections/PROGENy';
import * as crisprRaw from './sections/CRISPR';
import * as sysBioRaw from './sections/SysBio';

export const animalModels = animalModelsRaw;
export const differentialExpression = differentialExpressionRaw;
export const drugs = drugsRaw;
export const gwasCatalog = gwasCatalogRaw;
// export const pathways = pathwaysRaw;
export const phewasCatalog = phewasCatalogRaw;
export const reactome = reactomeRaw;
export const slapenrich = slapenrichRaw;
export const progeny = progenyRaw;
export const crispr = crisprRaw;
export const sysBio = sysBioRaw;
