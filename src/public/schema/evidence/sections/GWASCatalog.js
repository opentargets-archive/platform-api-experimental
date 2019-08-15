import { gql } from 'apollo-server-express';

import { evidenceGWASCatalog } from '../../../apis/openTargets';

export const id = 'gwasCatalog';

export const summaryTypeDefs = gql`
  type EvidenceSummaryGwasCatalog {
    variantCount: Int!
    sources: [Source!]!
  }
`;

export const summaryResolvers = {
  EvidenceSummaryGwasCatalog: {
    variantCount: ({ _ensgId, _efoId }) =>
      evidenceGWASCatalog(_ensgId, _efoId).then(
        ({ variantCount }) => variantCount
      ),
    sources: () => [
      {
        name: 'GWAS Catalog',
        url:
          'https://docs.targetvalidation.org/data-sources/genetic-associations#gwas-catalog',
      },
    ],
  },
};

export const sectionTypeDefs = gql`
  enum VEPConsequence {
    TRANSCRIPT_ABLATION
    SPLICE_ACCEPTOR_VARIANT
    SPLICE_DONOR_VARIANT
    STOP_GAINED
    FRAMESHIFT_VARIANT
    STOP_LOST
    START_LOST
    TRANSCRIPT_AMPLIFICATION
    INFRAME_INSERTION
    INFRAME_DELETION
    MISSENSE_VARIANT
    PROTEIN_ALTERING_VARIANT
    SPLICE_REGION_VARIANT
    INCOMPLETE_TERMINAL_CODON_VARIANT
    START_RETAINED_VARIANT
    STOP_RETAINED_VARIANT
    SYNONYMOUS_VARIANT
    CODING_SEQUENCE_VARIANT
    MATURE_MIRNA_VARIANT
    FIVE_PRIME_UTR_VARIANT
    THREE_PRIME_UTR_VARIANT
    NON_CODING_TRANSCRIPT_EXON_VARIANT
    INTRON_VARIANT
    NMD_TRANSCRIPT_VARIANT
    NON_CODING_TRANSCRIPT_VARIANT
    UPSTREAM_GENE_VARIANT
    DOWNSTREAM_GENE_VARIANT
    TFBS_ABLATION
    TFBS_AMPLIFICATION
    TF_BINDING_SITE_VARIANT
    REGULATORY_REGION_ABLATION
    REGULATORY_REGION_AMPLIFICATION
    FEATURE_ELONGATION
    REGULATORY_REGION_VARIANT
    FEATURE_TRUNCATION
    INTERGENIC_VARIANT
    NEAREST_GENE_FIVE_PRIME_END # this is a fake consequence that we invented
  }
  type EvidenceRowGwasCatalog {
    disease: Disease!
    rsId: String!
    pval: Float!
    oddsRatio: Float
    confidenceInterval: String
    vepConsequence: VEPConsequence
    source: Source!
  }
  type EvidenceDetailGwasCatalog {
    rows: [EvidenceRowGwasCatalog!]!
  }
`;

export const sectionResolvers = {
  EvidenceDetailGwasCatalog: {
    rows: ({ _ensgId, _efoId }) =>
      evidenceGWASCatalog(_ensgId, _efoId).then(({ rows }) => rows),
  },
};
