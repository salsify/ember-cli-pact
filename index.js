/* eslint-env node, es6 */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = {
  name: 'ember-cli-pact',

  config(env) {
    return {
      'ember-cli-pact': {
        providerName: null,
        consumerName: this.project.name(),
        mockProvider: 'mirage',
        serviceInjections: ['store'],
        pactsDirectory: 'pacts',
        mode: process.env.PACT_MODE || (process.env.CI ? 'verify' : 'write'),
        pactVersion: 3,
        enabled: env !== 'production'
      }
    };
  },

  shouldIncludeChildAddon(addon) {
    // Always include Babel so ember-cli doesn't complain
    return this._isEnabled() || addon.name === 'ember-cli-babel';
  },

  treeFor() {
    // Most of the addon is in addon-test-support and only included
    // in the test environment; however, a few elements are potentially
    // used with Mirage, which is enabled in the development environment
    // by default and _may_ also be enabled in production (in which case
    // the enabled config can be set to true explicitly)
    if (this._isEnabled()) {
      return this._super.treeFor.apply(this, arguments);
    }
  },

  treeForAddonTestSupport(tree) {
    // intentionally not calling _super here
    // so that can have our `import`'s be
    // import { ... } from 'ember-cli-pact';

    const Funnel = require('broccoli-funnel');

    let namespacedTree = new Funnel(tree, {
      srcDir: '/',
      destDir: `/${this.moduleName()}`,
      annotation: `Addon#treeForTestSupport (${this.name})`,
    });

    return this.preprocessJs(namespacedTree, '/', this.name, {
      registry: this.registry,
    });
  },

  testemMiddleware(app) {
    if (this._isEnabled()) {
      const PactMiddleware = require('./lib/pact-middleware');
      new PactMiddleware(this._readConfig()).attach(app);
    }
  },

  _isEnabled() {
    return this._readConfig().enabled !== false;
  },

  _readConfig() {
    return this.project.config(EmberApp.env())['ember-cli-pact'] || {};
  }
};
