const { isError } = require('lodash');

const isPromise = promise => Promise.resolve(promise) === promise;

const toError = error => (isError(error) ? error : Error(error));

module.exports = {
  isPromise,
  toError,
};
