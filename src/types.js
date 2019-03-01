const isError = error => error instanceof Error;

const isPromise = promise => Promise.resolve(promise) === promise;

const toError = error => (isError(error) ? error : Error(error));

module.exports = {
  isError,
  isPromise,
  toError,
};
