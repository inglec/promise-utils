const { isError, reduce } = require('lodash');

const { toError } = require('./types');

// Convert a rejected value into a resolved Error
const catchError = promise => promise.catch(toError);

// Split array of resolved values into object of resolved values and rejected Errors
const partition = (object, labels) => {
  const keys = !Array.isArray(object) && !labels ? Object.keys(object) : labels;

  return reduce(
    object,
    (acc, value, key) => {
      if (isError(value)) {
        acc.rejected[key] = value;
      } else {
        acc.resolved[key] = value;
      }

      return acc;
    },
    {
      rejected: keys ? {} : [],
      resolved: keys ? {} : [],
    },
  );
};

// Call Promise creators in order
const sequence = (
  promises,
  afterEach = (value, next) => next(value),
  handleReject = error => Promise.reject(error),
) => {
  // Skip the applying `afterEach` to initial value
  const handleResolve = (value, next, i) => (i === 0 ? next(value) : afterEach(value, next));
  const afterAll = value => Promise.resolve(value);

  return promises
    .reduce((acc, next, i) => (
      acc
        .then(value => handleResolve(value, next, i))
        .catch(error => handleReject(error))
    ), Promise.resolve())
    .then(value => afterEach(value, afterAll));
};

// Sequence Promise creators, but fail on rejection
const chain = (promises, returnAll = false) => {
  if (!returnAll) {
    return sequence(promises);
  }

  const values = [];
  const seq = sequence(promises, (value, next) => {
    values.push(value);
    return next(value);
  });

  return seq.then(() => values);
};

// Sequence Promise creators, but handle rejections
const queue = (object, passErrors = false) => {
  const isArray = Array.isArray(object);
  const keys = isArray ? undefined : Object.keys(object);
  const promises = isArray ? object : Object.values(object);

  const values = [];
  const seq = sequence(
    promises,
    (value, next) => {
      values.push(value);

      return passErrors || !isError(value) ? next(value) : next();
    },
    error => toError(error),
  );

  return seq.then(() => partition(values, keys));
};

const wait = promises => (
  Promise
    .all(promises.map(catchError))
    .then(partition)
);

module.exports = {
  catchError,
  chain,
  partition,
  queue,
  sequence,
  wait,
};
