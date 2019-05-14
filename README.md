# cloudblob-api-serverless
Serverless and cloud object storage as a database

Use this repo as a starter for a "no-sql" like REST API using AWS S3 as storage backend. Have a look at the underlying [cloudblob-store](https://github.com/cloudblob/cloudblob-store) library to see how the guts work.

## Usage

Clone this repo and then adjust the `config.json` file to your needs.

Example:
```javascript
{
    "storage": {
        "type": "aws"
    },
    "database": "example-db", // this should match an existing empty S3 bucket name
    "namespaces": [
        {
            "namespace": "users",
            "index": { // the 'index' field is optional. If you merely want a key-value store then leave it out.
                "lib":  "flex", // which indexer to use, options are 'flex' or 'elasticlunr'
                "fields": ["name", "about", "description"] // list all the field names that should be indexed
            },
            "ref": "_id" // the field name to use for injecting the auto-generated ID into the document.
        }
    ]
}
```

## Indexer libraries
There are two indexer libraries that are used [Elasticlunr](https://github.com/weixsong/elasticlunr.js) and [flexsearch](https://github.com/nextapps-de/flexsearch). Have a look at them to decide which one fits your use case best.

## REST Endpoints

This code provides Create, Read and List endpoints through the help of API Gateway. 

### GET /v1/{namespace}
List all documents of a namespace, or filter them based on `query`. This endpoint matches the namespace provided to configured namespaces in `config.json` and returns a 404 response if namespace not configured.

|parameter|default|
|-|-|
|query|Empty|
|count|20|

### POST /v1/{namespace}
Create a new entity in the namespace and returns the newly created entity. There is no schema validation at this stage.

### GET /v1/{namespace}/{id}
Read a specific entity from the namespace with unique identifier `id`.


## TODO
- Add a separate lambda function to perform entity indexing. This should be triggered by an SQS queue which gets populated by S3 events.
