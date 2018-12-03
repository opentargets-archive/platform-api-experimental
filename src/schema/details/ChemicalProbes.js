import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type RowChemicalProbes {
    chemicalProbe: String!
    note: String
    sources: [Source!]!
  }
  type TargetDetailChemicalProbes {
    rows: [RowChemicalProbes!]!
    probeMinerUrl: String
  }
`;

export const resolvers = {
  TargetDetailChemicalProbes: {
    rows: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.rows),
    probeMinerUrl: ({ _ensgId }, args, { targetLoader }) =>
      targetLoader
        .load(_ensgId)
        .then(({ chemicalProbes }) => chemicalProbes.probeMinerUrl),
  },
};
