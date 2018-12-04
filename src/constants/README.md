# Constants

The files in this directory contain useful constants that are not currently present in the REST API. Some are obtained by downloading reference files manually, others by calling external REST APIs. They can be reproduced as described below.

## Mouse phenotypes top-level phenotypes

Make a GET request to https://www.ebi.ac.uk/ols//api/ontologies/mp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FMP_0000001/jstree/children/99815577_1.

## Reactome top-level pathways

Make a GET request to https://reactome.org/ContentService/data/pathways/top/9606.

## UniProt sub-cellular locations

First download the locations TSV file from [UniProt](https://www.uniprot.org/locations/). Assuming this was downloaded to your `~/Downloads` directory, now run the following from the root directory of the `platform-api` repo.

```
cat ~/Downloads/locations-all.tab | jq -rRs '[split("\n")[1:-1] | .[] | split("\t")| {"id":.[0], "description":.[1], "category":.[2], "name":.[3]}]' > ./src/constants/uniprotSubCellularLocations.json
```

## UniProt keywords

The keywords file in the `constants` directory is downloaded from [UniProt](https://www.uniprot.org/docs/keywlist.txt).
