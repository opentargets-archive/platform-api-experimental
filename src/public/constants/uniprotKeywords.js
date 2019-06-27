import fs from 'fs';

/*
  Each term in the file keywlist.txt is structured as below.
  We are only interested in the lines starting ID, AC and CA.
  The separator between terms is a line containing only //.
    //
    ID   Abscisic acid biosynthesis.
    AC   KW-0937
    DE   Protein involved in the synthesis of abscisic acid (ABA) (5-(1-
    DE   hydroxy-2,6,6,trimethyl-4-oxocyclohex-2-en-1-y1)-3-methylpenta-2,4-
    DE   dienoic acid). ABA is a plant hormone which play a role in many
    DE   aspects of plant growth, development and cellular signaling (e.g. seed
    DE   dormancy, seed maturation, vegetative growth and responses to various
    DE   environmental stimuli such as stomatal closure during drought). This
    DE   phytohormone can be synthesized from farnesyl diphosphate (direct C15
    DE   pathway) or from 9-cis-violaxanthine (indirect C40 pathway).
    SY   ABA anabolism; ABA biosynthesis; ABA formation; ABA synthesis;
    SY   Abscisic acid anabolism; Abscisic acid biosynthetic process;
    SY   Abscisic acid formation; Abscisic acid synthesis.
    GO   GO:0009688; abscisic acid biosynthetic process
    HI   Biological process: Abscisic acid biosynthesis.
    CA   Biological process.
    //
*/

const lines = fs
  .readFileSync(`${__dirname}/keywlist.txt`)
  .toString()
  .split('\n');

const start =
  lines.indexOf(
    '___________________________________________________________________________'
  ) + 1;
const end =
  lines.indexOf(
    'Copyrighted by the UniProt Consortium, see https://www.uniprot.org/terms'
  ) - 1;

const relevantLines = lines.slice(start, end);
const relevantLinesGroupedByTerm = relevantLines
  .join('\n')
  .split('//\n')
  .map(t => t.split('\n'));

const keywords = relevantLinesGroupedByTerm
  .map(ls => {
    const acLine = ls.find(l => l.startsWith('AC   '));
    const idLine = ls.find(l => l.startsWith('ID   '));
    const caLine = ls.find(l => l.startsWith('CA   '));
    return {
      id: acLine.split('AC   ')[1],
      name: idLine ? idLine.split('ID   ')[1].slice(0, -1) : null,
      category: caLine ? caLine.split('CA   ')[1].slice(0, -1) : null,
    };
  })
  .filter(d => d.name && d.category);

const lookup = keywords.reduce((acc, d) => {
  acc[d.name] = d;
  return acc;
}, {});

export default lookup;
