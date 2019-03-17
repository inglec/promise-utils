const Results = require('./Results');

const sequence = async (promiseCreators, afterEach, handleError) => {
  let value;
  for (let i = 0; i < promiseCreators.length; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      value = await promiseCreators[i](value);
      if (afterEach) {
        afterEach(value, i);
      }
    } catch (error) {
      if (handleError) {
        value = handleError(error);
      } else {
        throw error;
      }
    }
  }

  return value;
};

// Sequence Promise creators
const chain = async (promiseCreators) => {
  const values = [];
  await sequence(promiseCreators, value => values.push(value));
  return values;
};

// Sequence Promise creators, but handle rejections
const queue = async (object) => {
  const isArray = Array.isArray(object);
  const keys = isArray ? null : Object.keys(object);
  const promiseCreators = isArray ? object : Object.values(object);

  const results = new Results();
  const afterEach = (value, i) => results.addResolved(value, isArray ? null : keys[i]);
  const handleError = (error) => {
    results.addRejected(error);
    return error;
  };

  await sequence(promiseCreators, afterEach, handleError);
  return results;
};

// Promise.all but handle rejections
const wait = async (promises) => {
  const results = new Results();
  const wrapped = promises.map(promise => (
    promise
      .then(value => results.addResolved(value))
      .catch(error => results.addRejected(error))
  ));
  await Promise.all(wrapped);
  return results;
};

const repeatWhile = async (promiseCreator, predicate, handleErrors = false) => {
  const results = new Results();

  let previous;
  for (let i = 0; predicate(previous, i); i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const value = await promiseCreator(previous);
      results.addResolved(value);
      previous = value;
    } catch (error) {
      if (handleErrors) {
        results.addRejected(error);
        previous = error;
      } else {
        throw error;
      }
    }
  }

  return results;
};

// Call a promise creator any number of times in a row
const repeat = (promiseCreator, iterations = 1) => (
  repeatWhile(promiseCreator, (value, i) => i < iterations)
);

module.exports = {
  chain,
  queue,
  repeat,
  repeatWhile,
  sequence,
  wait,
};
