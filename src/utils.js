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

const chain = promises => promises.reduce((acc, promise) => acc.then(promise), Promise.resolve());

const wait = promises => (
  Promise
    .all(promises.map(convertRejected))
    .then(partition)
);

module.exports = {
  convertRejected,
  chain,
  partition,
  wait,
};
