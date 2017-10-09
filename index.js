/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-cli-pact',

  testemMiddleware(app) {
    const bodyParser = require('body-parser');

    app.post('/_pact/upload', bodyParser.json({ limit: '50mb' }), (req, res) => {
      // TODO deal with incoming pact payloads
      res.send('ok');
    });
  }
};
