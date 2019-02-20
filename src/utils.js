const { isError, toError } = require('./types');

// Convert a rejected value into a resolved Error.
const catchError = promise => promise.catch(toError);

// Split array of resolved values into object of resolved values and rejected Errors.
const partition = values => (
  values.reduce(
    (acc, value) => {
      if (isError(value)) {
        acc.rejected.push(value.toString());
      } else {
        acc.resolved.push(value);
      }

      return acc;
    },
    {
      rejected: [],
      resolved: [],
    },
  )
);

// Call Promise creators in order.
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
          // Don't apply afterEach on first iteration to skip the initial value.
          i > 0 ? afterEach(value, next) : next(value)
        ))
        .catch(error => handleError(error))
    ), Promise.resolve())
    .then(value => afterEach(value, afterAll));
};

// Sequence Promise creators, but fail on rejection.
const chain = (promises, returnAll = false) => {
  if (!returnAll) {
    return sequence(promises);
  }

  // Array of intermediate resolved values.
  const values = [];

  const last = sequence(promises, (value, next) => {
    values.push(value);
    return next(value);
  });

  return last.then(() => values);
};

// Sequence Promise creators, but handle rejections.
const queue = (promises, passErrors = false) => {
  const values = [];

  const last = sequence(
    promises,
    (value, next) => {
      if (isError(value)) {
        values.push(value);
      }

      return next(value);
    },
    (error) => {
      const value = toError(error);
      values.push(value);

      return passErrors ? value : undefined;
    },
  );

  return last.then(() => partition(values));
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
