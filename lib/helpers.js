/**
 * Helpers to validate requests and configuration.
 */
const Datastore = require('@cloudblob/store')
const AWS = require('@cloudblob/store/lib/storage').AWS
const Flexsearch = require('@cloudblob/store/lib/indexer').Flexsearch
const Elasticlunr = require('@cloudblob/store/lib/indexer').Elasticlunr


/**
 * Example use:
 * 
 * checkNamespace(cfg, 'user')
 * // prints true or false
 * 
 */
exports.checkNamespace = function(config, namespace) {
  for (let i in config.namespaces) {
    let n = config.namespaces[i]

    if (n.namespace === namespace)
      return true
  }

  return false
}

exports.getParamsFromEvent = function(event) {
  const params = {
    namespace: null,
    query: null,
    body: null,
    id: null,
    count: null
  }

  if (event.pathParameters != null){
    params.namespace = event.pathParameters.namespace
    params.id = event.pathParameters.id
  }

  if (event.queryStringParameters != null){
    params.query = event.queryStringParameters.query
    params.count = event.queryStringParameters.count
  }

  if (event.method === "POST")
    params.body = event.body

  return params
}

/**
 * Initialize the store from a config file. This declares the storage backend
 * and creates all the indexer objects. The actual indexes are however 
 * lazy loaded.
 */
exports.initStoreFromConfig = function(config) {

  // SETUP THE STORAGE BACKEND
  let storageBackend = null
  if (config.storage.type === 'aws' ){
    storageBackend = new AWS(config.storage.config)
  }

  // INITIALIZE THE INDEXER FOR SEARCHING
  let namespaces = {}
  for (let i in config.namespaces) {
    let n = config.namespaces[i]
    namespaces[n.namespace] = {}
    if (n.index && n.index.lib) {
      if (n.index.lib === 'elasticlunr')
        namespaces[n.namespace].indexer = new Elasticlunr(n.index.fields, n.ref)
      else if (n.index.lib === 'flex')
        namespaces[n.namespace].indexer = new Flexsearch(n.index.fields, n.ref)
    }
    namespaces[n.namespace].ref = n.ref
  }

  return new Datastore({
    db: config.database,
    storage: storageBackend,
    persist: true,
    // specify the namespaces and their indexer class
    namespaces: namespaces
  });
}

/**
 * 
 */
exports.response = function(status, body) {
  return {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(body)
  };
}