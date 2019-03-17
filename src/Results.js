const REJECTED = 'rejected';
const RESOLVED = 'resolved';

class Results {
  constructor() {
    this.results = null;
    this.last = null;
  }

  add(type, value, key) {
    if (type !== REJECTED && type !== RESOLVED) {
      throw Error(`type must equal "${REJECTED}" or "${RESOLVED}"`);
    }

    const result = { type, value };

    if (key) {
      if (!this.results) {
        this.results = {};
      }
      this.results[key] = result;
    } else {
      if (!this.results) {
        this.results = [];
      }
      this.results.push(result);
    }

    this.last = value;
  }

  addResolved(value, key) {
    this.add(RESOLVED, value, key);
  }

  addRejected(rejected, key) {
    this.add(REJECTED, rejected, key);
  }

  partition() {
    if (!this.results) {
      return null;
    }

    if (Array.isArray(this.results)) {
      return this.results.reduce(
        (acc, { type, value }) => {
          acc[type].push(value);
          return acc;
        },
        { [REJECTED]: [], [RESOLVED]: [] },
      );
    }

    const keys = Object.keys(this.results);
    const values = Object.values(this.results);
    return values.reduce(
      (acc, { type, value }, i) => {
        acc[type][keys[i]] = value;
        return acc;
      },
      { [REJECTED]: {}, [RESOLVED]: {} },
    );
  }

  values() {
    if (!this.results) {
      return null;
    }

    if (Array.isArray(this.results)) {
      return this.results.map(result => result.value);
    }

    const keys = Object.keys(this.results);
    const values = Object.values(this.results);
    return values.reduce((acc, { value }, i) => {
      acc[keys[i]] = value;
      return acc;
    }, {});
  }
}

module.exports = Results;
