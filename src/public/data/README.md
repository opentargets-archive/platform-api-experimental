# Data files used in the GraphQL API

At present, the GraphQL API uses the Open Targets REST API. It is hoped that a refactoring of the pipeline and data storage will move some of the files stored here into a database. They are stored as flat files (and loaded into memory) for developmental convenience.

## EFO

The file `efo2.1904.json` contains a minimal representation of the EFO 2 directed acyclic graph (with additional root term). It was generated from a dump of the `efo` ElasticSearch index. The script used is [here](https://github.com/peatroot/efo-vis/blob/master/efo_parser.py), though this should become an automated part of the pipeline before production use.
