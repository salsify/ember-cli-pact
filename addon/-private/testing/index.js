/* global Testem */

import require from 'require';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import { getContext } from 'ember-test-helpers';
import { uploadInteraction, finalize } from './upload';

export function setupPact(hooks = {}, options = {}) {
  // QUnit passes hooks explicitly; with Mocha they're implicit
  if (typeof hooks.beforeEach !== 'function') {
    options = hooks;
    hooks = makeMochaHooks();
  }

  // Mocha will have unset the context by the time our `afterEach` runs,
  // so we stash it in `beforeEach` instead.
  let context;

  hooks.beforeEach(function(assert) {
    context = getContext();
    setupServices(context, this, options);
    setupProvider(context, options, assert.test.testName);
  });

  hooks.afterEach(function() {
    return teardownProvider(context, options);
  });
}

function makeMochaHooks() {
  let mocha = require('mocha');
  return {
    afterEach: mocha.afterEach,
    beforeEach(callback) {
      mocha.beforeEach(function() {
        // Quick'n'dirty way to pass the test name from Mocha the same as from QUnit
        let assert = { test: { testName: this.currentTest.title } };
        return callback.call(this, assert);
      });
    }
  };
}

function setupServices(context, target, options) {
  for (let service of getConfigValue(context, options, 'serviceInjections')) {
    target[service] = () => findOwner(context).lookup(`service:${service}`);
  }
}

function getConfigValue(context, options, key) {
  if (key in options) {
    return options[key];
  } else {
    return getConfig(context)['ember-cli-pact'][key];
  }
}

function getConfig(context) {
  return findOwner(context).resolveRegistration('config:environment');
}

function findOwner(context) {
  return context.owner || getOwner(context);
}

function setupProvider(context, options, testName) {
  let MockProvider = loadMockProvider(context, options);
  let provider = context._pactProvider = new MockProvider(getConfig(context));

  assertSingleConsumerName(context, options);

  provider.startInteraction(testName);
}

function loadMockProvider(context, options) {
  let { modulePrefix } = getConfig(context);
  let name = getConfigValue(context, options, 'mockProvider');
  return require(`${modulePrefix}/tests/helpers/pact-providers/${name}`).default;
}

function assertSingleConsumerName(context, options) {
  let localConsumerName = options.consumerName;
  let globalConsumerName = getConfig(context)['ember-cli-pact'].consumerName;
  let hasOverriddenConsumer = localConsumerName && localConsumerName !== globalConsumerName;
  assert(`ember-cli-pact doesn't currently support testing multiple consumers`, !hasOverriddenConsumer);
}

function teardownProvider(context, options) {
  let provider = context._pactProvider;
  let interaction = provider.serializeInteraction(getConfigValue(context, options, 'pactVersion'));
  let upload = uploadInteraction(interaction, {
    provider: getConfigValue(context, options, 'providerName'),
    consumer: getConfigValue(context, options, 'consumerName')
  });

  registerFinalizeCallback();

  provider.endInteraction();

  return upload;
}

let addedFinalizeCallback = false;
function registerFinalizeCallback() {
  if (!addedFinalizeCallback) {
    addedFinalizeCallback = true;

    // istanbul ignore next: runs after coverage has been reported
    Testem.afterTests((config, data, callback) => {
      finalize()
        .catch((error) => setTimeout(() => { throw error; }))
        .then(() => setTimeout(callback));
    });
  }
}
