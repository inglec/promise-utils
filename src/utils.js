const { isError, toError } = require('./types');

// Convert a rejected value into a resolved Error
const catchError = promise => promise.catch(toError);

// Split array of resolved values into object of resolved values and rejected Errors
const partition = (object) => {
  if (Array.isArray(object)) {
    return object.reduce(
      (acc, value) => {
        acc[isError(value) ? 'rejected' : 'resolved'].push(value);

        return acc;
      },
      { rejected: [], resolved: [] },
    );
  }

  const keys = Object.keys(object);
  const values = Object.values(object);

  return values.reduce(
    (acc, value, i) => {
      const key = keys[i];
      acc[isError(value) ? 'rejected' : 'resolved'][key] = value;

      return acc;
    },
    { rejected: {}, resolved: {} },
  );
};

// Call Promise creators in order
const sequence = (
  promises,
  afterEach = (value, next) => next(value),
  handleReject = error => Promise.reject(error),
) => {
  const handleResolve = (value, next, i) => (
    // Skip the applying `afterEach` to initial value
    i === 0
      ? next(value)
      : afterEach(value, next, i - 1)
  );
  const afterAll = value => Promise.resolve(value);

  return promises
    .reduce((acc, next, i) => (
      acc
        .then(value => handleResolve(value, next, i))
        .catch(error => handleReject(error))
    ), Promise.resolve())
    .then(value => afterEach(value, afterAll, promises.length - 1));
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

  const values = isArray ? [] : {};
  const seq = sequence(
    promises,
    (value, next, i) => {
      const key = isArray ? i : keys[i];
      values[key] = value;

      return passErrors || !isError(value) ? next(value) : next();
    },
    error => toError(error),
  );

  return seq.then(() => partition(values));
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
