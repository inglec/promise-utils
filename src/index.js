const { isPromise } = require('./types');
const {
  convertRejected,
  chain,
  partition,
  wait,
} = require('./utils');

module.exports = {
  chain,
  convertRejected,
  isPromise,
  partition,
  wait,
};
