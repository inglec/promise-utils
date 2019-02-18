const { isError } = require('./types');

// Convert a rejected value into a resolved Error.
const convertRejected = promise => (
  promise.catch(error => (isError(error) ? error : Error(error)))
);

// Split array of resolved values into object of resolved values and rejected Errors.
const partition = values => (
  values.reduce(
    (acc, value) => {
      if (isError(value)) {
        acc.rejected.push(value);
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

const chain = (promises) => {
  const values = [];

  return promises
    .reduce((acc, promise) => (
      acc.then((value) => {
        values.push(value);

        return promise(value);
      })
    ), Promise.resolve())
    .then(() => values);
};

const wait = promises => (
  Promise
    .all(promises.map(convertRejected))
    .then(partition)
);

module.exports = {
  chain,
  convertRejected,
  partition,
  wait,
};
