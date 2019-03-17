const Results = require('../src/Results');

describe('add', () => {
  test('throws error for unexpected type', () => {
    const results = new Results();
    const regex = /^type must equal ".+" or ".+"$/;

    expect(() => results.add(null, 'value', 'key')).toThrow(regex);
    expect(() => results.add('bad type', 'value', 'key')).toThrow(regex);
  });
});

describe('addResolved', () => {
  test('adds unkeyed values', () => {
    const results = new Results();
    results.addResolved('value1');
    results.addResolved('value2');

    expect(results).toEqual(
      expect.objectContaining({
        results: [
          { type: 'resolved', value: 'value1' },
          { type: 'resolved', value: 'value2' },
        ],
      }),
    );
  });

  test('adds keyed values', () => {
    const results = new Results();
    results.addResolved('value1', 'key1');
    results.addResolved('value2', 'key2');

    expect(results).toEqual(
      expect.objectContaining({
        results: {
          key1: { type: 'resolved', value: 'value1' },
          key2: { type: 'resolved', value: 'value2' },
        },
      }),
    );
  });
});

describe('partition', () => {
  test('returns null for empty results', () => expect(new Results().partition()).toBe(null));

  test('partitions array', async () => {
    const results = new Results();
    results.addResolved('value1');
    results.addResolved('value2');
    results.addRejected(Error('error1'));
    results.addRejected(Error('error2'));

    expect(results.partition()).toEqual({
      resolved: ['value1', 'value2'],
      rejected: [Error('error1'), Error('error2')],
    });
  });

  test('partitions object', () => {
    const results = new Results();
    results.addResolved('value1', 'key1');
    results.addResolved('value2', 'key2');
    results.addRejected(Error('error1'), 'key3');
    results.addRejected(Error('error2'), 'key4');

    expect(results.partition()).toEqual({
      resolved: {
        key1: 'value1',
        key2: 'value2',
      },
      rejected: {
        key3: Error('error1'),
        key4: Error('error2'),
      },
    });
  });
});

describe('values', () => {
  test('returns null for empty results', () => expect(new Results().values()).toBe(null));

  test('returns values array', () => {
    const results = new Results();
    results.addResolved('value1');
    results.addResolved('value2');
    results.addRejected(Error('error1'));
    results.addRejected(Error('error2'));

    expect(results.values()).toEqual(['value1', 'value2', Error('error1'), Error('error2')]);
  });

  test('returns values object', () => {
    const results = new Results();
    results.addResolved('value1', 'key1');
    results.addResolved('value2', 'key2');
    results.addRejected(Error('error1'), 'key3');
    results.addRejected(Error('error2'), 'key4');

    expect(results.values()).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: Error('error1'),
      key4: Error('error2'),
    });
  });
});
