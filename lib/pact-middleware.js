'use strict';

const TestSession = require('./test-session');
const PactError = require('./pact-error');
const bodyParser = require('body-parser');
const debug = require('debug')('ember-cli-pact:middleware');

module.exports = class PactMiddleware {
  constructor(config) {
    this.config = config;
    this.session = null;
    this.discarded = new Set();
  }

  attach(app) {
    app.post('/_pact/upload', bodyParser.json({ limit: '50mb' }), this.dispatch('addInteraction'));
    app.post('/_pact/finalize', bodyParser.json({ limit: '50mb' }), this.dispatch('finalize'));
  }

  dispatch(method) {
    return (req, res) => {
      try {
        let sessionId = req.body.session;
        if (!this.discarded.has(sessionId)) {
          this.ensureSession(sessionId)[method](req.body);
        }
        res.sendStatus(204);
      } catch (error) {
        if (error instanceof PactError) {
          res.status(error.status).send(error.message);
        } else {
          debug('Error dispatching request: %s', error.message);
          res.status(500).send(error.message);
        }
      }
    };
  }

  ensureSession(id) {
    let currentId = this.session && this.session.id;
    if (currentId && currentId !== id) {
      debug('Discarding session %s', currentId);
      this.discarded.add(currentId);
      this.session = null;
    }

    if (!this.session) {
      debug('Starting session %s', id);
      this.session = new TestSession(id, this.config);
    }

    return this.session;
  }
}
