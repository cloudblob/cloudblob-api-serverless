/**
 * Contains the basic crud & filtering logic for entities.
 */


/**
 * Find entities by specific query.
 */
exports.filter = function(db, namespace, query) {
  return db.filter(namespace, query).then((data) => {
    const readList = data.results.map(ref => db.get(namespace, ref))
    return Promise.all(readList)
  })
};

/**
 * List entities limiting by count
 */
exports.list = function(db, namespace, count) {
  return db.list(namespace, count)
};

/**
 * Create a new document
 */
exports.create = function(db, namespace, body) {
  return db.put(namespace, body)
};

/**
 * Read & return doc or resolve with null.
 */
exports.get_or_reject = function(db, namespace, id) {
  return db.exists(namespace, id).then(exist => {
    return exist ? db.get(namespace, id) : Promise.resolve(null)
  })
};