'use strict';
const auth = require('@cloudblob/auth')
const Datastore = require('@cloudblob/store')

const config = require('./config.json')


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
  }
  namespaces[n.namespace].ref = n.ref
}

// CREATE THE DATASTORE CONNECTION
const store = new Datastore({
  db: config.database,
  storage: storageBackend,
  // specify the namespaces and their indexer class
  namespaces: namespaces
});



function response(status, body) {
  return {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(body)
  };
}

exports.entrypoint = (event, context, callback) => {
  const namespace = event.pathParameters

  if (namespaces[namespace]) {
    // namespace has been configured.
    if (config.namespaces[namespace].allowed_methods.indexOf(event.httpMethod)<0) {
      // method not allowed
      callback(null, response(405, {}));
    } else {
      // method allowed for namespace, read or save doc
      if (event.httpMethod === 'POST') {
        const doc = JSON.parse(event.body)

        store.put(namespace, key, doc).then(res => {
          if (res) 
            callback(null, response(201, res));
          else
            callback(null, response(400, res));
        }).catch(err => {
          callback(null, response(500, err));
        })
      } else if (event.httpMethod === 'GET') {
        const key = event.pathParameters
        
        store.get(namespace, key).then(res => {
          if (res) 
            callback(null, response(200, res));
          else
            callback(null, response(404, {}));
        }).catch(err => {
          callback(null, response(500, err));
        })
      }
    }
  } else {
    callback(null, response(404, {}));
  }
}

exports.authorize = function(event, context, callback) {
  
}


/**
 * 1. add user register, login & token refresh functions - this uses lambda as comm gateway
 * 2. add a `client-side` tokens param which returns AWS creds valid as long as JWT is valid.
 *    - this allows the javascript client to perform AWS calls directly and not even use Lambda,
 *    - makes it easier to utilize things like cloudfront.
 */