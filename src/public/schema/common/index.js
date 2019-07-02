// load sections
import * as sectionsObject from './sectionIndex';
const sections = Object.values(sectionsObject);

// combine type defs
export const typeDefs = sections.map(d => d.typeDefs);
