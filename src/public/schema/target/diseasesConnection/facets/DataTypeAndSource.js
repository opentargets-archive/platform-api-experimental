import { gql } from 'apollo-server-express';

export const id = 'dataTypeAndSource';

export const facetTypeDefs = gql`
  type DataTypeFacetItem {
    id: DataType!
    name: String!
    count: Int!
    children: [DataSourceFacetItem!]
  }
  type DataSourceFacetItem {
    id: DataSource!
    name: String!
    count: Int!
  }
  type TargetDiseasesConnectionFacetDataTypeAndSource {
    items: [DataTypeFacetItem!]!
  }
`;

export const facetInputTypeDefs = gql`
  enum DataSource {
    GWAS_CATALOG
    PHEWAS_CATALOG
    EVA
    EVA_SOMATIC
    GENE2PHENOTYPE
    GENOMICS_ENGLAND
    INTOGEN
    CANCER_GENE_CENSUS
    REACTOME
    PROGENY
    SLAPENRICH
    CRISPR
    SYSBIO
    CHEMBL
    EXPRESSION_ATLAS
    EUROPEPMC
    PHENODIGM
    UNIPROT
    UNIPROT_SOMATIC
    UNIPROT_LITERATURE
  }
  enum DataType {
    GENETIC_ASSOCIATION
    SOMATIC_MUTATION
    KNOWN_DRUGS
    PATHWAYS
    DIFFERENTIAL_EXPRESSION
    ANIMAL_MODELS
    TEXT_MINING
  }
  input TargetDiseasesConnectionFacetInputDataTypeAndSource {
    dataTypeIds: [DataType!]
    dataSourceIds: [DataSource!]
  }
`;

export const facetResolvers = {
  TargetDiseasesConnectionFacetDataTypeAndSource: {
    items: ({ _facets }) => _facets.dataTypeAndSource.items,
  },
};
