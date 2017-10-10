/* eslint-env node, es6 */
'use strict';

module.exports = {
  name: 'ember-cli-pact',

  config() {
    return {
      'ember-cli-pact': {
        mockProvider: 'mirage',
        providerName: 'provider',
        consumerName: this.project.name(),
        pactsDirectory: 'pacts'
      }
    };
  },

  testemMiddleware(app) {
    const PactMiddleware = require('./lib/pact-middleware');
    let config = this.project.config()['ember-cli-pact'];
    let middleware = new PactMiddleware(config);

    middleware.attach(app);
  },
};
