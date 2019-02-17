const isError = error => error instanceof Error;

const isPromise = promise => Promise.resolve(promise) === promise;

module.exports = {
  isError,
  isPromise,
};
