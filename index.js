/* eslint-env node, es6 */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = {
  name: 'ember-cli-pact',

  config() {
    return {
      'ember-cli-pact': {
        providerName: null,
        consumerName: this.project.name(),
        mockProvider: 'mirage',
        serviceInjections: ['store'],
        pactsDirectory: 'pacts',
        mode: process.env.PACT_MODE || (process.env.CI ? 'verify' : 'write'),
        pactVersion: 3
      }
    };
  },

  testemMiddleware(app) {
    const PactMiddleware = require('./lib/pact-middleware');
    let config = this.project.config(EmberApp.env())['ember-cli-pact'];
    let middleware = new PactMiddleware(config);

    middleware.attach(app);
  },
};
