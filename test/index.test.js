const {
  // catchError,
  chain,
  isPromise,
  // partition,
  // queue,
  // sequence,
  wait,
} = require('../src/index.js');

describe('chain', () => {
  test('chains array of resolving Promise creators', () => {
    const promises = [
      () => Promise.resolve(1),
      value => Promise.resolve(value + 1),
    ];

    // Return final resolved value.
    expect(chain(promises))
      .resolves
      .toBe(2);

    // Return all resolved values.
    expect(chain(promises, true))
      .resolves
      .toEqual(expect.arrayContaining(1, 2));
  });

  test('rejects with rejecting Promise', () => {
    const promises = [
      () => Promise.resolve(1),
      value => Promise.reject(Error(value + 1)),
      value => Promise.resolve(value + 1),
    ];

    expect(chain(promises))
      .rejects
      .toThrow(2);
  });
});

describe('isPromise', () => {
  test('returns true for Promise contructor', () => {
    const promise = new Promise(() => {});

    expect(isPromise(promise)).toBe(true);
  });

  test('returns true for resolved Promise', () => {
    const promise = Promise.resolve();

    expect(isPromise(promise)).toBe(true);
  });

  test('returns true for rejected Promise', () => {
    const promise = Promise.reject();

    expect(isPromise(promise)).toBe(true);
  });

  test('returns false for string', () => {
    expect(isPromise('test')).toBe(false);
  });

  test('returns false for object with key "then"', () => {
    const object = { then: 'hello' };

    expect(isPromise(object)).toBe(false);
  });
});

describe('queue', () => {
  test('', () => {
    test('returns object of resolved Promises', () => {
      const promises = [
        () => Promise.resolve(1),
        value => Promise.resolve(value + 1),
      ];

      expect(wait(promises))
        .resolves
        .toMatchObject({ resolved: [1, 2] });
    });
  });

  // TODO: Write more tests.
});

describe('wait', () => {
  test('returns object of resolved Promises', () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
    ];

    expect(wait(promises))
      .resolves
      .toMatchObject({ resolved: [1, 2] });
  });

  test('returns object of rejected Promises', () => {
    const rejected1 = Error(1);
    const rejected2 = Error(2);
    const promises = [
      Promise.reject(rejected1),
      Promise.reject(rejected2),
    ];

    expect(wait(promises))
      .resolves
      .toMatchObject({ rejected: [rejected1, rejected2] });
  });

  test('returns object of resolved and rejected Promises', () => {
    const rejected = Error(2);
    const promises = [
      Promise.resolve(1),
      Promise.reject(rejected),
    ];

    expect(wait(promises))
      .resolves
      .toMatchObject({ resolved: [1], rejected: [rejected] });
  });
});
