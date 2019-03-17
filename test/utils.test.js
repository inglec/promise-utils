const {
  chain,
  queue,
  repeat,
  repeatWhile,
  sequence,
  wait,
} = require('../src/utils.js');

describe('chain', () => {
  test('chains array of resolving Promise creators', () => {
    const promiseCreators = [
      () => Promise.resolve(1),
      value => Promise.resolve(value + 1),
    ];

    // Return all resolved values.
    expect(chain(promiseCreators))
      .resolves
      .toEqual([1, 2]);
  });

  test('rejects with rejecting Promise', () => {
    const promiseCreators = [
      () => Promise.resolve(1),
      value => Promise.reject(Error((value + 1).toString())),
      value => Promise.resolve(value + 1),
    ];

    return expect(chain(promiseCreators))
      .rejects
      .toThrow('2');
  });
});

describe('queue array', () => {
  test('returns object of resolved Promises', () => {
    const promiseCreators = [
      () => Promise.resolve(1),
      value => Promise.resolve(value + 1),
    ];

    const promise = queue(promiseCreators).then(results => results.partition());
    return expect(promise)
      .resolves
      .toEqual(
        expect.objectContaining({ resolved: [1, 2] }),
      );
  });
});

describe('queue object', () => {
  test('returns object of resolved Promises', () => {
    const promiseCreators = {
      one: () => Promise.resolve(1),
      two: value => Promise.resolve(value + 1),
    };

    const promise = queue(promiseCreators).then(results => results.partition());
    return expect(promise)
      .resolves
      .toEqual(
        expect.objectContaining({ resolved: { one: 1, two: 2 } }),
      );
  });
});

describe('wait', () => {
  test('returns object of resolved Promises', () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
    ];

    const promise = wait(promises).then(results => results.partition());
    return expect(promise)
      .resolves
      .toMatchObject({ resolved: [1, 2] });
  });

  test('returns object of rejected Promises', () => {
    const promises = [
      Promise.reject(Error('1')),
      Promise.reject(Error('2')),
    ];

    const promise = wait(promises).then(results => results.partition());
    return expect(promise)
      .resolves
      .toMatchObject({ rejected: [Error('1'), Error('2')] });
  });

  test('returns object of resolved and rejected Promises', () => {
    const promises = [
      Promise.resolve(1),
      Promise.reject(Error('2')),
    ];

    const promise = wait(promises).then(results => results.partition());
    return expect(promise)
      .resolves
      .toMatchObject({ resolved: [1], rejected: [Error('2')] });
  });
});
