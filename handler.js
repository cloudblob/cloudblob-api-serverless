'use strict';
const config = require('./config.json')
const entities = require('./lib/entities')
const helpers = require('./lib/helpers')

const response = helpers.response

function validate (event, callback) {
  // Return 404 if namespace is not configured
  // this needs to happen for each namespace endpoint hit.
  const params = helpers.getParamsFromEvent(event)
  if (!helpers.checkNamespace(config, params.namespace)){
    callback(null, response(404, {msg: "Namespace not found."}))
    return null
  }

  return {
    store: helpers.initStoreFromConfig(config),
    ...params
  }
}

module.exports.list = (event, context, callback) => {
    const {count, namespace, store, query} = validate(event, callback);

    if (query) {
      entities.filter(store, namespace, query).then(res => {
        callback(null, response(200, res))
      })
    } else {
      entities.list(store, namespace, count).then(res => {
        callback(null, response(200, res))
      })
    }
};

module.exports.get = function(event, context, callback) {
  const {namespace, store, id} = validate(event, callback);

  entities.get_or_reject(store, namespace, id).then(doc => {
    callback(null, response(200, doc))
  }).catch(err => {
    if (err === null) {
      callback(null, response(404, {msg: "Could not find "+namespace+" entity"}))
    } else {
      callback(err.message)
    }
  })
}

module.exports.create = function(event, context, callback) {
  const {namespace, store, body} = validate(event, callback);

  entities.create(store, namespace, body).then(doc => {
    callback(null, response(201, doc))
  }).catch(err => {
    callback(null, response(400, {msg: err.message}))
  })
}