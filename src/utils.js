const { isError, toError } = require('./types');

// Convert a rejected value into a resolved Error
const catchError = promise => promise.catch(toError);

// Split array of resolved values into object of resolved values and rejected Errors
const partition = (values, keys) => {
  // Return object
  if (keys) {
    return values.reduce(
      (acc, value, i) => {
        const key = keys[i];

        if (isError(value)) {
          acc.rejected[key] = value;
        } else {
          acc.resolved[key] = value;
        }

        return acc;
      },
      { rejected: {}, resolved: {} },
    );
  }

  // Return arrays
  return values.reduce(
    (acc, value) => {
      if (isError(value)) {
        acc.rejected.push(value);
      } else {
        acc.resolved.push(value);
      }

      return acc;
    },
    { rejected: [], resolved: [] },
  );
};

// Call Promise creators in order
const sequence = (
  promises,
  afterEach = (value, next) => next(value),
  handleError = error => Promise.reject(error),
) => {
  const afterAll = value => Promise.resolve(value);

  return promises
    .reduce((acc, next, i) => (
      acc
        .then(value => (
          // Don't apply afterEach on first iteration to skip the initial value
          i > 0 ? afterEach(value, next) : next(value)
        ))
        .catch(error => handleError(error))
    ), Promise.resolve())
    .then(value => afterEach(value, afterAll));
};

// Sequence Promise creators, but fail on rejection
const chain = (promises, returnAll = false) => {
  if (!returnAll) {
    return sequence(promises);
  }

  // Array of intermediate resolved values
  const values = [];

  const last = sequence(promises, (value, next) => {
    values.push(value);
    return next(value);
  });

  return last.then(() => values);
};

// Sequence Promise creators, but handle rejections
const queue = (promises, passErrors = false) => {
  const values = [];

  const last = sequence(
    promises,
    (value, next) => {
      values.push(value);

      return passErrors || !isError(value) ? next(value) : next();
    },
    error => toError(error),
  );

  // Pass array of keys if promise creators is an object.
  const keys = Array.isArray(promises) ? undefined : Object.keys(promises);

  return last.then(() => partition(values, keys));
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
