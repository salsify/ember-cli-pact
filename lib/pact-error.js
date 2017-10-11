'use strict';

module.exports = class PactError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
