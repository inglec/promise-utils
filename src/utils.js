const { toError } = require('./types');

// Convert a rejected value into a resolved Error
const catchError = promise => promise.catch(toError);

// Split array of resolved values into object of resolved values and rejected Errors
const partition = (object) => {
  if (Array.isArray(object)) {
    return object.reduce(
      (acc, value) => {
        acc[value instanceof Error ? 'rejected' : 'resolved'].push(value);

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
      acc[value instanceof Error ? 'rejected' : 'resolved'][key] = value;

      return acc;
    },
    { rejected: {}, resolved: {} },
  );
};

// Call Promise creators in order
const sequence = (
  promiseCreators,
  afterEach = (value, next) => next(value),
  handleReject = error => Promise.reject(error),
) => {
  const handleResolve = (value, next, i) => (
    // Skip applying `afterEach` to initial value
    i === 0
      ? next(value)
      : afterEach(value, next, i - 1)
  );
  const afterAll = value => Promise.resolve(value);

  return promiseCreators
    .reduce((acc, next, i) => (
      acc
        .then(value => handleResolve(value, next, i))
        .catch(error => handleReject(error))
    ), Promise.resolve())
    .then(value => afterEach(value, afterAll, promiseCreators.length - 1));
};

// Sequence Promise creators, but fail on rejection
const chain = (promiseCreators, returnAll = false) => {
  if (!returnAll) {
    return sequence(promiseCreators);
  }

  const values = [];
  const seq = sequence(promiseCreators, (value, next) => {
    values.push(value);
    return next(value);
  });

  return seq.then(() => values);
};

// Sequence Promise creators, but handle rejections
const queue = (object, passErrors = false) => {
  const isArray = Array.isArray(object);
  const keys = isArray ? undefined : Object.keys(object);
  const promiseCreators = isArray ? object : Object.values(object);

  const values = isArray ? [] : {};
  const seq = sequence(
    promiseCreators,
    (value, next, i) => {
      const key = isArray ? i : keys[i];
      values[key] = value;

      return (passErrors || !(value instanceof Error)) ? next(value) : next();
    },
    error => toError(error),
  );

  return seq.then(() => partition(values));
};

const wait = promiseCreators => (
  Promise
    .all(promiseCreators.map(catchError))
    .then(partition)
);

// Call a promise creator any number of times in a row
const repeat = async (promiseCreator, iterations = 1) => {
  const values = [];

  let previous;
  for (let i = 0; i < iterations; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const value = await promiseCreator(previous);

    previous = value;
    values.push(value);
  }

  return values;
};

module.exports = {
  catchError,
  chain,
  partition,
  queue,
  repeat,
  sequence,
  wait,
};
