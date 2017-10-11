/* eslint-env node */
'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    'ember-cli-babel': {
      includePolyfill: true
    },

    babel: {
      plugins: [
        'transform-class-properties'
      ]
    }
  });

  if ('ember-cli-mocha' in require('./package.json').devDependencies) {
    app.import('vendor/testing/qunit-shims.js');
  } else {
    app.import('vendor/testing/mocha-shims.js');
  }

  return app.toTree();
};
