const { isPromise } = require('./types');
const {
  catchError,
  chain,
  partition,
  queue,
  sequence,
  wait,
} = require('./utils');

module.exports = {
  catchError,
  chain,
  isPromise,
  partition,
  queue,
  sequence,
  wait,
};
