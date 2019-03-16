const toError = error => (error instanceof Error ? error : Error(error));

module.exports = { toError };
