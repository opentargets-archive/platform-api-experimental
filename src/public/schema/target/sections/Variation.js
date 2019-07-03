import { gql } from 'apollo-server-express';

import {
  targetVariantsCommon,
  targetVariantsRare,
} from '../../../apis/openTargets';

export const id = 'variation';

export const summaryTypeDefs = gql`
  type VariationCommon {
    variantsCount: Int!
    diseasesCount: Int!
  }
  type VariationRare {
    mutationsCount: Int!
    diseasesCount: Int!
  }
  type TargetSummaryVariation {
    common: VariationCommon!
    rare: VariationRare!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  TargetSummaryVariation: {
    common: ({ _ensgId }) =>
      targetVariantsCommon(_ensgId).then(response => {
        const evs = response.data.data;
        const variantsCount = new Set(evs.map(d => d.variant.id)).size;
        const diseasesCount = new Set(evs.map(d => d.disease.efo_info.efo_id))
          .size;
        return { variantsCount, diseasesCount };
      }),
    rare: ({ _ensgId }) =>
      targetVariantsRare(_ensgId).then(response => {
        const evs = response.data.data;
        const mutationsCount = new Set(evs.map(d => d.variant.id)).size;
        const diseasesCount = new Set(evs.map(d => d.disease.efo_info.efo_id))
          .size;
        return { mutationsCount, diseasesCount };
      }),
    sources: () => [
      {
        name: 'Ensembl',
        url: 'https://www.ensembl.org',
      },
      {
        name: 'GWAS Catalog',
        url: 'https://www.ebi.ac.uk/gwas/',
      },
      {
        name: 'PheWAS Catalog',
        url: 'https://phewascatalog.org/',
      },
      {
        name: 'EVA',
        url: 'https://www.ebi.ac.uk/eva/',
      },
      {
        name: 'UniProt',
        url: 'https://www.uniprot.org/',
      },
    ],
  },
};
