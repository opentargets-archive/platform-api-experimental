import { disease } from "../apis/openTargets";

const diseaseDAG = (obj, { efoId }) => {
  return disease(efoId).then(response => {
    // for some reason, path_codes and path_labels are not zipped
    const {
      path_codes: pathCodes,
      path_labels: pathLabels,
      children,
    } = response.data;
    const paths = pathCodes.map((cs, i) =>
      cs.map((c, j) => ({
        id: c,
        name: pathLabels[i][j],
      }))
    );

    // flatten to node list
    const nodesObj = paths.reduce((acc, p) => {
      const pReversed = p.reverse();
      pReversed.forEach(({ id, name }, i) => {
        // init node?
        if (!acc[id]) {
          acc[id] = {
            id,
            name,
            parentIds: [],
            nodeType: id === efoId ? "base" : "parent",
          };
        }
        if (i < pReversed.length - 1) {
          // add parent?
          const parentId = pReversed[i + 1].id;
          if (acc[id].parentIds.indexOf(parentId) < 0) {
            acc[id].parentIds.push(parentId);
          }
        }
      });
      return acc;
    }, {});

    const childrenObj = children.reduce((acc, d) => {
      acc[d.code] = {
        id: d.code,
        name: d.label,
        parentIds: [efoId],
        nodeType: "child",
      };
      return acc;
    }, {});
    const nodes = [...Object.values(nodesObj), ...Object.values(childrenObj)];

    return { nodes };
  });
};

export default diseaseDAG;
