# Data files used in the GraphQL API

At present, the GraphQL API uses the Open Targets REST API. It is hoped that a refactoring of the pipeline and data storage will move some of the files stored here into a database. They are stored as flat files (and loaded into memory) for developmental convenience.

## EFO

The file `efo2.1904.json` contains a minimal representation of the EFO 2 directed acyclic graph (with additional root term). It was generated from a dump of the `efo` ElasticSearch index. The script used is [here](https://github.com/peatroot/efo-vis/blob/master/efo_parser.py), though this should become an automated part of the pipeline before production use.

The file `efo3.1911.hacked.json` contains a minimal representation of the EFO 3 directed acyclic graph (with additional root term). It was generated from a dump of the `efo` ElasticSearch index. The script used is [here](https://github.com/peatroot/efo-vis/blob/master/efo_parser.py), though this should become an automated part of the pipeline before production use. This was then further modified to put children of `disease` as therapeutic areas (ie. direct children of `EFO_ROOT`) and to remove `disease`.

## Mouse phenotypes top-level phenotypes

Make a GET request to https://www.ebi.ac.uk/ols//api/ontologies/mp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FMP_0000001/jstree/children/99815577_1.

## Reactome top-level pathways

Make a GET request to https://reactome.org/ContentService/data/pathways/top/9606.

## UniProt

### Sub-cellular locations

First download the locations TSV file from [UniProt](https://www.uniprot.org/locations/). Assuming this was downloaded to your `~/Downloads` directory, now run the following from the root directory of the `platform-api` repo.

```
cat ~/Downloads/locations-all.tab | jq -rRs '[split("\n")[1:-1] | .[] | split("\t")| {"id":.[0], "description":.[1], "category":.[2], "name":.[3]}]' > ./src/constants/uniprotSubCellularLocations.json
```

### Keywords

The keywords file in the `constants` directory is downloaded from [UniProt](https://www.uniprot.org/docs/keywlist.txt).
