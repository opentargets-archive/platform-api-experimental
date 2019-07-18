// TODO: see if this can be done dynamically
//       or try @babel/plugin-proposal-export-namespace-from (may need eject)

import * as mechanismsOfActionRaw from './sections/MechanismsOfAction';
import * as linkedTargetsRaw from './sections/LinkedTargets';

export const mechanismsOfAction = mechanismsOfActionRaw;
export const linkedTargets = linkedTargetsRaw;
