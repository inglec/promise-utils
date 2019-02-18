const { isPromise } = require('./types');
const {
  chain,
  convertRejected,
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
