/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-cli-pact',

  config() {
    return {
      'ember-cli-pact': {
        mockProvider: 'mirage',
        finalizationTimeout: 10 * 60 * 1000,
        providerName: 'provider',
        consumerName: this.project.name()
      }
    };
  },

  testemMiddleware(app) {
    const bodyParser = require('body-parser');

    app.post('/_pact/upload', bodyParser.json({ limit: '50mb' }), (req, res) => {
      // TODO deal with incoming pact payloads
      res.send('ok');
    });

    app.post('/_pact/finalize', bodyParser.json(), (req, res) => {
      // TODO handle session finalization
      res.send('ok');
    });
  }
};
