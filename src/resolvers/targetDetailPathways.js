// import _ from "lodash";
// import { target } from "../apis/openTargets";

// const targetDetailPathways = async (obj, { ensgId }) => {
//   const response = await target(ensgId);
//   const { data } = response;

//   if (!data.reactome) {
//     return null;
//   }

//   const { reactome } = data;

//   const secondary = reactome.map(d => ({
//     id: d.id,
//     name: d.value["pathway name"],
//     parentIds: d.value["pathway types"].map(d2 => d2["pathway type"]),
//   }));
//   const primary = Object.values(
//     reactome.reduce((acc, d) => {
//       d.value["pathway types"].forEach(d2 => {
//         if (!acc[d2["pathway type"]]) {
//           acc[d2["pathway type"]] = {
//             id: d2["pathway type"],
//             name: d2["pathway type name"],
//             parentIds: null,
//           };
//         }
//       });
//       return acc;
//     }, {})
//   );

//   return {
//     nodes: [...primary, ...secondary],
//   };
// };

// export default targetDetailPathways;
