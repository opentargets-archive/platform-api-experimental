// TODO: see if this can be done dynamically
//       or try @babel/plugin-proposal-export-namespace-from (may need eject)

import * as drugsRaw from './sections/Drugs';
import * as pathwaysRaw from './sections/Pathways';

export const drugs = drugsRaw;
export const pathways = pathwaysRaw;
